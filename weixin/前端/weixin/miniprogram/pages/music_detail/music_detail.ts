// pages/music_detail/music_detail.ts
import { formatNumber } from "../../utils/util";
export {}

// 获取初始数据
const app = getApp<IAppOption>(),
  loopInfo = ["循环播放", "单曲循环", "顺序播放", "随机播放"],
  playInfo = ["播放", "暂停"],
  preNextInfo = ["上一首", "下一首"],
  nextListInfo = "音乐列表",
  audioCtx = wx.createInnerAudioContext({useWebAudioImplement: false});

// 音乐信息类
class MusicInfo {
  id?: number;
  album?: string;
  artist?: string;
  duration?: number;
  pic?: string;
  release_date?: string;
  sname?: string;
  song_time_minutes?: string;
  url?: string;
  weight?: number;

  constructor(id?: number, album?: string, artist?: string, duration?: number, pic?: string, 
    release_date?: string, sname?: string, song_time_minutes?: string, url?: string, 
    weight?: number) {
      this.id = id;
      this.album = album;
      this.artist = artist;
      this.duration = duration;
      this.pic = pic;
      this.release_date = release_date;
      this.sname = sname;
      this.song_time_minutes = song_time_minutes;
      this.url = url;
      this.weight = weight;
  }
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    songTimeMinutes: "00:00",
    iconLoopList: [""],
    iconLoopIndex: 0,
    playPauseList: ["../../resources/image/播放.png", "../../resources/image/暂停.png"],
    preList: ["../../resources/image/上一首.png", "../../resources/image/上一首 (1).png"],
    nextList: ["../../resources/image/下一首.png", "../../resources/image/下一首 (1).png"],
    preIndex: 0,
    nextIndex: 0,
    playIndex: 0,
    currentTime: 0,
    musicList: [new MusicInfo()],
    isPlaying: false,
    showMusicList: false
  },

  /**
   * 获取音乐列表
  */
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
        // 设置音乐数据集和音频源
        that.setData({
          musicList: response.data
        });
        audioCtx.src = response.data[that.data.index].url;
      }
    });
  },

  /**
   * 将整数转换为[分钟:秒]形式
  */
  formatTimeMimutes(value: number): string {
    // 分钟
    const m = Number(Math.floor(value / 60).toFixed(0));
    // 秒
    value %= 60;
    return [m, value].map(formatNumber).join(":");
  },

  /**
   * 音乐滑动条滑动
  */
  sliderChange(event: WechatMiniprogram.CustomEvent): void {
    const currentTime: number = event.detail.value,
          that = this;
    // 设置显示时间并暂停音乐播放
    this.setData({
      songTimeMinutes: that.formatTimeMimutes(currentTime),
      playIndex: 0
    });
    audioCtx.seek(currentTime);
    audioCtx.pause();
  },

  /**
   * 获取循环按钮图像列表
  */
  getIconLoopList(): string[] {
    const iconLoopList = [
      "../../resources/image/24gl-repeat2.png",
      "../../resources/image/24gl-repeatOnce2.png",
      "../../resources/image/顺序播放.png",
      "../../resources/image/24gl-shuffle.png"
    ];
    return iconLoopList;
  },

  /**
   * 切换循环按钮
  */
  changeLoop(): void {
    const index = (this.data.iconLoopIndex + 1) % this.data.iconLoopList.length;
    this.setData({
      iconLoopIndex: index
    });
  },

  /**
   * 定位到指定下标音乐
  */
  seekMusic(index: number): void {
    const length = this.data.musicList.length,
          musicInfo = this.data.musicList[this.data.index];

    // 下标合法时设置数据
    if (0 <= index && index < length) {
      this.setData({
        index: index,
        currentTime: 0,
        songTimeMinutes: this.formatTimeMimutes(musicInfo.duration as number)
      });
      // 更新音频源并定位到开始位置
      audioCtx.src = musicInfo.url as string;
      audioCtx.seek(0);

      // 第一首音乐时前一首设置灰色样式
      if (index <= 0) {
        this.setData({
          preIndex: 1
        });
      }
      // 末尾音乐时后一首设置灰色样式
      if (index >= length - 1) {
        this.setData({
          nextIndex: 1
        });
      }
    }
  },

  /**
   * 长按音乐按钮时显示提示信息
  */
  showIconInfo(event: WechatMiniprogram.CustomEvent): void {
    let index: number = event.currentTarget.dataset.index,
        title = "", image = "";

    // 依据index设置相应信息
    if (0 == index) {
      title = loopInfo[this.data.iconLoopIndex];
      image = this.data.iconLoopList[this.data.iconLoopIndex];
    } else if (1 == index) {
      title = preNextInfo[0];
      image = "../../resources/image/上一首.png";
    } else if (2 == index) {
      title = playInfo[this.data.playIndex];
      image = this.data.playPauseList[this.data.playIndex];
    } else if (3 == index) {
      title = preNextInfo[1];
      image = "../../resources/image/下一首.png";
    } else if (4 == index) {
      title = nextListInfo;
      image = "../../resources/image/24gf-playlistMusic2.png";
    }

    wx.showToast({
      title: title,
      duration: 2000,
      mask: true,
      image: image
    });
  },

  /**
   * 播放-暂停状态转换
  */
  changeState(): void {
    const index = (this.data.playIndex + 1) % this.data.playPauseList.length,
          that = this;
    // 切换按钮
    this.setData({
      playIndex: index
    });

    // 播放音乐
    if (1 == index && audioCtx.paused) {
      audioCtx.play();
      // 注册时间更新事件,在音乐播放时滑动条和显示时间更新
      audioCtx.onTimeUpdate(() => {
        that.setData({
          currentTime: audioCtx.currentTime,
          songTimeMinutes: that.formatTimeMimutes(Math.floor(audioCtx.currentTime)),
          isPlaying: true
        });

        // 处理音乐循环按钮信息
        const currentTime = that.data.currentTime,
              musicInfo = that.data.musicList[that.data.index],
              iconLoopIndex = that.data.iconLoopIndex;
        // 当前音乐结束时根据选择的按钮进行下一首音乐的选择
        if (currentTime >= (musicInfo.duration as number)) {
          if (0 == iconLoopIndex) {
            // 循环播放
            this.toNext();
            this.changeState();
          } else if (1 == iconLoopIndex) {
            // 单曲循环
            this.seekMusic(that.data.index);
          } else if (2 == iconLoopIndex) {
            // 顺序播放
            that.toNext();
            that.changeState();
            setTimeout(() => {
              that.changeState();
            }, 1000);
          } else if (3 == iconLoopIndex) {
            // 随机播放
            this.seekMusic(Math.floor(Math.random() * this.data.musicList.length))
          }
        }
      });
    } else {
      // 暂停音乐
      audioCtx.pause();
      this.setData({
        isPlaying: false
      });
    }
  },

  /**
   * 前一首
  */
  toPre(): void {
    let index = this.data.index;
    
    // 定位到前一首
    if (index > 0) {
      index--;
      const musicInfo = this.data.musicList[index];
      // 设置数据
      this.setData({
        index: index,
        currentTime: 0,
        songTimeMinutes: "00:00"
      });
      audioCtx.src = musicInfo.url as string;
      audioCtx.seek(0);

      // 第一首
      if (index <= 0) {
        this.setData({
          preIndex: 1
        });
      }
    }

    // 处理下一首按钮灰色样式
    if (index + 1 < this.data.musicList.length) {
      this.setData({
        nextIndex: 0
      });
    }
  },

  /**
   * 下一首
  */
  toNext(): void {
    let index = this.data.index,
        length = this.data.musicList.length;
    // 定位下一首
    if (index < length - 1) {
      index++;
      const musicInfo = this.data.musicList[index];
      this.setData({
        index: index,
        currentTime: 0,
        songTimeMinutes: "00:00",
        isPlaying: false,
        playIndex: 0
      });
      audioCtx.src = musicInfo.url as string;
      audioCtx.seek(0);

      if (index >= length - 1) {
        this.setData({
          nextIndex: 1
        });
      }
    }

    // 处理前一首按钮灰色样式
    if (index >= 0) {
      this.setData({
        preIndex: 0
      });
    }
  },

  /**
   * 打开音乐列表
  */
  openMusicList(): void {
    const showMusicList = this.data.showMusicList;
    this.setData({
      showMusicList: !showMusicList
    });
    console.log("open...");
  },

  /**
   * 选择音乐列表音乐
  */
  chooseMusic(event: WechatMiniprogram.TouchEvent): void {
    const index: number = Number(event.currentTarget.dataset.index),
          musicInfo = this.data.musicList[index];
    console.log(`你选择了：${musicInfo.sname}，index：${index}`);
    if (!audioCtx.paused) {
      this.changeState();
    }
    this.setData({
      index: index,
      currentTime: 0,
      isPlaying: false,
      showMusicList: false,
      songTimeMinutes: "00:00"
    });
    audioCtx.src = musicInfo.url as string;
    audioCtx.seek(0);
  },

  /**
   * 下载音乐
  */
  downloadMusic(): void {
    const musicInfo = this.data.musicList[this.data.index],
          nickname = wx.getStorageSync("nickname");
    
    // 未登录时显示提示信息
    if (!nickname) {
      wx.showToast({
        title: "登录后可下载",
        duration: 2000,
        mask: true
      });
      return;
    }
    
    wx.showLoading({
      title: "下载中...",
      mask: true
    });

    // 下载
    wx.downloadFile({
      url: musicInfo.url as string,
      success: res => {
        if (200 == res.statusCode) {
          // 保存到相册
          wx.saveVideoToPhotosAlbum({
            filePath: res.tempFilePath,
            complete: () => {
              wx.hideLoading();
            }
          });
        }
      },
      fail: err => {
        console.error(err);
        wx.showLoading({
          title: "下载失败"
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options: Record<string, string | undefined>) {
    // 处理从其它页面到达的数据
    const index: number = Number(options.index);
    this.setData({
      index: index,
      iconLoopList: this.getIconLoopList()
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
    // 进行音乐列表的获取
    const limitStart = wx.getStorageSync("limitStart"),
          searchKey = wx.getStorageSync("searchKey");
    this.queryMusicList(searchKey || "", limitStart || 0);
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
    // 卸载页面时暂停音频
    audioCtx.pause();
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