// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperList: [new Object()],
    musicList: [new Object()],
    recommandList: [""],
    recomandActiveIndex: 0
  },

  /**
   * 获取轮播图
  */
  getSwiperList(): object[] {
    const swiperList = [{
      src: "../../resources/image/u=1581705318,2499847240&fm=253&fmt=auto&app=138&f=JPEG.webp",
      toTarget: "",
      desc: "尽享音乐之美"
    }, {
      src: "../../resources/image/u=2194930705,801877904&fm=253&fmt=auto&app=138&f=JPEG.jpg",
      toTarget: "",
      desc: "尽享音乐之美"
    }, {
      src: "../../resources/image/u=3579994699,3361350451&fm=253&fmt=auto&app=138&f=JPEG.webp",
      toTarget: "",
      desc: "尽享音乐之美"
    }];
    return swiperList;
  },

  /**
   * 点击轮播图
  */
  toTarget(event: WechatMiniprogram.TouchEvent): void {
    console.log(event.currentTarget.dataset.desc);
  },

  /**
   * 获取音乐
  */
  queryMusicList(key = "", limitStart = 0, limitLen = 30): void {
    console.log("正在获取音乐列表...");
    const that = this;
    // 向后端发送请求，设置数据到页面
    wx.request({
      url: `${app.globalData.basePath}/music/query`,
      method: "GET",
      data: {
        key: key,
        limit_start: limitStart,
        limit_len: limitLen
      },
      header: {
        "Content-Type": "application/json"
      },
      success: res => {
        const response: any = res.data;
        console.log(response.data);
        that.setData({
          musicList: response.data
        });
      }
    });
  },

  /**
   * 获取推荐列表
  */
  getRecommandList(): string[] {
    const recommandList = ["每日推荐", "翻唱", "网络", "伤感", "欧美"];
    return recommandList;
  },

  /**
   * 点击推荐歌单项时，获取分类音乐数据
  */
  recommandTap(event: WechatMiniprogram.TouchEvent): void {
    // 获取Index，显示激活样式
    const index: number = event.currentTarget.dataset.index;
    this.setData({
      recomandActiveIndex: index
    });
    
    // 查询Index+10开始的30条数据（未完成，暂时的）
    this.queryMusicList("", index + 10);
    // 音乐详情页将获取
    wx.setStorageSync("limitStart", index + 10);
  },

  /**
   * 进入指定音乐详情页
  */
  toMusicDetail(event: WechatMiniprogram.TouchEvent): void {
    let index: string = event.currentTarget.dataset.index;
    console.log(index);
    wx.setStorageSync("searchKey", "");
    wx.navigateTo({
      url: `../music_detail/music_detail?index=${index}`
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.setData({
      swiperList: this.getSwiperList(),
      recommandList: this.getRecommandList()
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
    this.queryMusicList();
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
    this.queryMusicList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(opts): WechatMiniprogram.Page.ICustomShareContent {
    console.log(opts.target)
    return {}
  }
})