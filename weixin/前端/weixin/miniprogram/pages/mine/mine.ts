// pages/mine/mine.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avartar: "../../resources/image/我的.png",
    nickname: "登录"
  },

  /**
   * 改变用户图像
  */
  changeAvatar(): void {
    const nickname = wx.getStorageSync("nickname");

    // 未登录时显示信息并终止程序
    if (!nickname) {
      wx.showToast({
        title: "未登录",
        duration: 2000,
        mask: true,
        icon: "error"
      });
      return;
    }

    // 选择文件并设置
    wx.chooseMedia({
      success: res => {
        this.setData({
          avartar: res.tempFiles[0].tempFilePath
        });
      }
    });
  },

  /**
   * 登录
  */
  login(): void {
    // 清除同步缓存
    wx.clearStorageSync();
    // 重定向到登录页面
    wx.redirectTo({
      url: "../login_register/login_register"
    });
  },

  /**
   * 切换到个人资料页面
  */
  toProfile(): void {
    // 未登录时显示提示信息
    if (!wx.getStorageSync("token")) {
      wx.showToast({
        title: "未登录",
        duration: 2000,
        mask: true,
        icon: "error"
      });
      return;
    }
    
    wx.navigateTo({
      url: "../profile/profile"
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 处理微信登录的信息获取
    const avartar = wx.getStorageSync("avatar"),
          nickname = wx.getStorageSync("nickname");
    if (avartar) {
      this.setData({
        avartar: avartar
      });
    }
    if (nickname) {
      this.setData({
        nickname: nickname
      });
    }
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