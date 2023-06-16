// pages/type/type.ts
const app = getApp<IAppOption>();
export {}

Page({

  /**
   * 页面的初始数据
   */
  data: { 
    search: "",
    historyList: [""],
    historyInput: "",
    typeList: [""],
    showTip: false,
    currentIndex: 0,
    musicList: [new Object()]
  },

  showTip(): void {
    this.setData({
      showTip: true
    });
  },

  hideTip(event: WechatMiniprogram.CustomEvent): void {
    const key: string = event.detail.value.trim();

    if (key.length > 0) {
      this.queryMusicList(key);
      const historyList: string[] = this.data.historyList;
      if (!historyList.includes(key)) {
        historyList.push(key);
      }
      this.setData({
        historyList: historyList,
        search: ""
      });
      wx.setStorageSync("searchKey", key);
      this.scrollHistoryInput(0);
    }
    this.setData({
      showTip: false
    });
  },

  getTypeList(): string[] {
    const typeList = ["推荐", "排行榜", "歌手"];
    return typeList;
  },

  changePage(event: WechatMiniprogram.TouchEvent): void {
    const currentIndex: number = Number(event.currentTarget.dataset.currentIndex);
    this.setData({
      currentIndex: currentIndex
    });
  },

  queryMusicList(key = "", limitStart = 0, limitLen = 30): void {
    console.log("正在获取音乐列表...");
    const that = this;
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

  scrollHistoryInput(index: number): void {
    const that = this,
          historyList = this.data.historyList;
    setTimeout(() => {
      that.scrollHistoryInput((index + 1) % historyList.length);
      that.setData({
        historyInput: historyList[index]
      });
    }, 3000);
  },

  toDetail(event: WechatMiniprogram.TouchEvent): void {
    wx.navigateTo({
      url: `../music_detail/music_detail?index=${event.currentTarget.dataset.index}`
    });
  },

  hisSearch(event: WechatMiniprogram.TouchEvent): void {
    const index: number = Number(event.currentTarget.dataset.index);
    this.setData({
      historyInput: this.data.historyList[index]
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.queryMusicList();
    this.scrollHistoryInput(0);
    this.setData({
      typeList: this.getTypeList()
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