// pages/profile/profile.ts
// 简介类
class Profile {
  city: string;
  email: string;
  gender: number;
  lang: string;
  province: string;
  uid: number;
  id: number;
  commentary: string;

  constructor(city: string, email: string, gender: number, lang: string, 
    province: string, uid: number, id: number, commentary: string) {
    this.city = city;
    this.email = email;
    this.gender = gender;
    this.lang = lang;
    this.province = province;
    this.uid = uid;
    this.id = id;
    this.commentary = commentary;
  }
}

const app = getApp<IAppOption>();
export {}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    profile: new Profile("", "", 0, "", "", 0, 0, ""),
    nickname: "",
    passwd: "",
    region: ""
  },

  /**
   * 更新简介
  */
  submitProfile(event: WechatMiniprogram.CustomEvent): void {
    wx.showLoading({
      title: "保存中..."
    });
    
    let profile: any = event.detail.value,
        region: string[] | string = profile.region;
    // 将地区转换为城市和省份
    if (Array.isArray(region)) {
      if (region.length > 1) {
        profile.province = profile.region[0];
        region.shift();
        profile.city = region.map((v: string) => v).join("/");
      } else if (1 == region.length) {
        profile.city = region[0];
      } else {
        profile.province = this.data.profile.province;
        profile.city = this.data.profile.city;
      }
    }
    
    console.log(profile);
    // 获取uid外键
    const token = wx.getStorageSync("token"),
          uid = wx.getStorageSync("uid");
    profile.uid = uid;
    // 后端更新数据
    wx.request({
      url: `${app.globalData.basePath}/user/profile/update`,
      method: "POST",
      header: {
        "content-type": "application/json"
      },
      data: {
        profile: profile,
        token: token
      },
      success: res => {
        wx.hideLoading();
        console.log(res);
        const response: any = res.data;
        // 显示提示信息
        wx.showToast({
          title: response.info,
          duration: 2000,
          mask: true,
          icon: "success"
        });
      }
    });
  },

  /**
   * 返回前一页
  */
  goBack(): void {
    wx.navigateBack();
  },

  /**
   * 切换地区
  */
  changeRegion(event: WechatMiniprogram.TouchEvent): void {
    const region: string = event.detail.value.map((v: any) => v).join("/");
    console.log(region);
    this.setData({
      region: region
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 获取登录信息
    const token = wx.getStorageSync("token"),
          uid = wx.getStorageSync("uid"),
          nickname = wx.getStorageSync("nickname"),
          passwd = wx.getStorageSync("passwd");

    this.setData({
      nickname: nickname,
      passwd: passwd
    });

    // 后端请求简介信息
    wx.request({
      url: `${app.globalData.basePath}/user/profile`,
      method: "POST",
      header: {
        "Content-Type": "application/json"
      },
      data: {
        uid: uid,
        token: token
      },
      success: res => {
        let profile: any = res.data;
        // 无数据时,终止程序
        if (profile.data.length <= 0) {
          return;
        }

        // 否则,设置简介数据
        profile = profile.data[0];
        this.setData({
          profile: profile,
          region: `${profile.province}/${profile.city}`
        });
        console.log(this.data.profile);
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})