// pages/login_register/login_register.ts
const app = getApp<IAppOption>();
export {} // 用于解决获取app后出现的红线

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: true,
    codeText: "获取验证码",
    isCodeActive: false
  },

  /**
   * 切换到注册模板
  */
  toRegister(): void {
    if (this.data.isLogin) {
      this.setData({
        isLogin: false
      });
    }
  },

  /**
   * 登录
  */
  submitLogin(event: WechatMiniprogram.TouchEvent): void {
    console.log("正在登录...");
    // 登录前进行表单验证，不通过时终止程序
    if (!this.validateForm(event)) {
      return;
    }

    const msg: any = event.detail.value,
          nickname: string = msg.nickname.trim(),
          passwd: string = msg.passwd.trim(),
          code: string = msg.code.trim();

    // 向后端请求登录
    wx.request({
      url: `${app.globalData.basePath}/user/login`,
      method: "POST",
      data: {
        user: msg,
        co: code
      },
      header: {
        "content-type": "application/json"
      },
      success: res => {
        const data: any = res.data;
        console.log(data);

        // 如果登录成功，设置同步缓存并切换到[我的]页面
        if (1 == data.code) {
          wx.setStorageSync("token", data.data.token);
          wx.setStorageSync("uid", data.data.id);
          wx.setStorageSync("nickname", nickname);
          wx.setStorageSync("passwd", passwd);
          console.log(msg);
          wx.showLoading({
            title: "登录中..."
          });
          setTimeout(() => {
            wx.redirectTo({
              url: "../mine/mine"
            });
            wx.showLoading({
              title: "登录成功"
            });
            setTimeout(() => {
              wx.hideLoading();
            }, 1000);
          }, 1000);
        } else {
          wx.showToast({
            title: data.info,
            duration: 2000
          });
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },

  /**
   * 注册
  */
  submitRegister(event: WechatMiniprogram.TouchEvent): void {
    console.log("正在注册...");
    // 表单验证
    if (!this.validateForm(event)) {
      return;
    }

    // 发送注册请求
    wx.request({
      url: `${app.globalData.basePath}/user/register`,
      method: "POST",
      data: {
        user: event.detail.value,
        co: event.detail.value.code
      },
      header: {
        "content-type": "application/json"
      },
      success: res => {
        const data: any = res.data;
        console.log(data);
        // 显示注册信息
        wx.showToast({
          title: data.info,
          duration: 2000
        });

        // 注册成功时，切换到登录模板进行登录
        if (data.data) {
          this.setData({
            isLogin: true
          });
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },

  /**
   * 校验表单
  */
  validateForm(event: WechatMiniprogram.TouchEvent): boolean {
    const user: any = event.detail.value,
          map: any = {
            nickname: "账号",
            passwd: "密码",
            phone: "电话号码",
            code: "验证码"
          };

    // 遍历表单值
    for (const key in user) {
      const value = user[key].trim();
      // 必填项为空时，显示提示信息
      if (value.length <= 0) {
        this.showValidateInfo(`${map[key]}不能为空`);
        return false;
      }

      // 对电话号码进行校验
      if ("phone" == key) {
        if (!(/^1[3-9]\d{9}$/.test(value))) {
          this.showValidateInfo("电话号码格式错误");
          return false;
        }
      }
    }
    return true;
  },

  /**
   * 显示校验信息
  */
  showValidateInfo(content: string): void {
    wx.showModal({
      title: "提示",
      content: content,
      showCancel: false
    });
  },

  /**
   * 设置请求验证码文本
  */
  setCodeText(count: number): number {
    // 已经点击获取验证码时，终止程序
    if (!this.data.isCodeActive) {
      return 0;
    }
    
    // 设置文本（60秒倒计时）
    const that = this;
    this.setData({
      codeText: `重新发送（${count}s）`
    });

    --count;
    // 设置超时事件（实现倒计时）
    const timeout = setTimeout(() => {
      that.setCodeText(count);
    }, 1000);

    // 如果小于0秒，重置文本
    if (count < 0) {
      this.setData({
        codeText: "获取验证码",
        isCodeActive: false
      });
      clearTimeout(timeout);
    }
    return timeout;
  },

  /**
   * 获取验证码
  */
  getCode(): void {
    // 设置验证码按钮激活
    this.setData({
      isCodeActive: true
    });
    this.setCodeText(60);

    // 等待3秒后发送获取验证码请求（显示倒计时）
    setTimeout(() => {
      wx.request({
        url: `${app.globalData.basePath}/user/code`,
        method: "GET",
        header: {
          "content-type": "application/json"
        },
        success: res => {
          const code: any = res.data;
          // 验证码获取成功时，显示模态框
          wx.showModal({
            title: "点击复制验证码",
            content: code,
            confirmText: "复制",
            success: res => {
              // 复制验证码
              if (res.confirm) {
                wx.setClipboardData({
                  data: code
                });
              }
            }
          });
          // 获取成功后，重置验证码文本
          this.setData({
            codeText: "获取验证码",
            isCodeActive: false
          });
        },
        fail: err => {
          console.log(err);
        }
      });
    }, 3000);
  },

  /**
   * 进行微信登录
  */
  getUserProfile() {
    wx.showLoading({
      title: "登录中..."
    });
    
    // @ts-ignore
    if (wx.getUserProfile) {
      // 获取用户信息
      wx.getUserProfile({
        desc: '用户信息',
        success: (res) => {
          // 成功时设置图像和昵称
          wx.setStorageSync("avatar", res.userInfo.avatarUrl);
          wx.setStorageSync("nickname", res.userInfo.nickName);
          // 进行用户登录
          wx.login({
            success: res => {
              wx.hideLoading();
              // 1秒后切换到[我的]页面
              setTimeout(() => {
                wx.redirectTo({
                  url: "../mine/mine"
                });
                wx.showLoading({
                  title: "登录成功"
                });
                setTimeout(() => {
                  wx.hideLoading();
                }, 1000);
              }, 1000);
            }
          });
        }
      });
    } else {
      // 不可调用获取函数时显示
      wx.showModal({
        title: "提示",
        content: "无法获取微信信息",
        showCancel: false
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    
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