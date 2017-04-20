// pages/game/index.js
Page({
  data:{
    gridSize:320,
    grid:[],
    isShow:false,//是否显示游戏结束提示
    data:[],//二维数组，保存游戏的数据
    rows:4,//格子数，4x4
    score:0,//保存当前得分
    topScore:0,
    top:0,//保存最高分
    state:1,//保存游戏状态:0结束 1运行
    touchDot: 0,//触摸时的原点
    time: 0,
    moveWay:0//滑动的方向，1上滑，2右滑，3下滑，4左滑，0没有滑动
  },
  touchStart:function(e){
    // console.log("touchStart",e);
    // 获取触摸时的原点,并保存触摸时间
    var touchDot = e.touches[0];
    this.setData({
      touchDot:touchDot,
      time:new Date().getTime()
    })
  },
  touchMove:function(e){
    // console.log("touchMove",e);
    var currentTime=new Date().getTime();
    if(currentTime-this.data.time>=20){
    //判断是左滑、右滑、上滑、下滑
      var currentTouchX=e.touches[0].pageX;
      var currentTouchY=e.touches[0].pageY;
      var touchDot=this.data.touchDot;
      var moveWay=0;
      if(touchDot.pageY-currentTouchY>=30){
        //上滑
        moveWay=1;
      }else if(currentTouchX-touchDot.pageX>=30){
        //右滑
        moveWay=2;
      }else if(currentTouchY-touchDot.pageY>=30){
        //下滑
        moveWay=3;
      }else if(touchDot.pageX-currentTouchX>=30){
        //左滑
        moveWay=4;
      }
      this.setData({
        moveWay:moveWay,
        time:new Date().getTime()
      })
    }
  },
  touchEnd:function(e){
    var moveWay=this.data.moveWay;
    // console.log("touchEnd",e,moveWay);
    switch(moveWay){
      case 1:
        //上滑
        this.moveUp();
        break;
      case 2:
        //右滑
        this.moveRight();
        break;
      case 3:
        //下滑
        this.moveDown();
        break;
      case 4:
        //左滑
        this.moveLeft();
        break;
      default:

    }
  },
  start:function(){
    //game start
    console.log("game start");
    //初始化数据二维数组,每个格的值都为0
    var data=[];
    for(var r=0;r<this.data.rows;r++){
      data[r]=[];
      for(var c=0;c<this.data.rows;c++){
        data[r][c]=0
      }
    }
    //调用API从本地缓存中获取最高分
    var topScore = wx.getStorageSync('topScore') || 0;
    this.setData({
      topScore:topScore,
      data:data
    });
    //生成两个随机数
    this.randomNum();
    this.randomNum();
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    //初始化游戏表格
    for(var r=0,arr=[];r<this.data.rows;r++){
      for(var c=0;c<this.data.rows;c++){
        var obj={
          row:r,
          cell:c
        }
        arr.push(obj);
      }
    }
    var rows=this.data.rows;
    var gridSize=rows*(60+10)+10;
    // var gridSize=rows*(size+gMargin)+gMargin;
    this.setData({
      grid:arr,
      gridSize:gridSize
    });
    this.start();


  },
  randomNum:function(){
    while(true){//循环:
    //在0~rows-1之间生成一个随机的整数行号r,c
      var r=Math.floor(Math.random()*this.data.rows);
      var c=Math.floor(Math.random()*this.data.rows);
      //如果data中r行c列等于0,将data中r行c列赋值为,随机生成一个小数<0.5?2:4
      if(this.data.data[r][c]==0){
        var data=this.data.data;
        data[r][c]=Math.random()<0.5?2:4;
        this.setData({
          data:data
        });
        break;
      }
    }
  },
  moveLeft:function(){
    //为data数组拍照，保存在before中
    var before=String(this.data.data);
    for(var r=0;r<this.data.rows;r++){
      //左移第r行
      this.moveLeftInRow(r);
    }
    //为data数组拍照，保存在after中
    var after=String(this.data.data);
    this.compareBeforeAndAfter(before,after);   
  },
  moveLeftInRow:function(r){
    //左移第r行,从左到右遍历
    for(var c=0;c<this.data.rows-1;c++){
      var nextc=this.getNextInRow(r,c);
      if(nextc==-1){
        break;
      }else{
        var data=this.data.data;
        //如果data中r行c列是0,将c位置的值改为nextc位置的值
        if(data[r][c]==0){
          //将nextc位置的值归0
          data[r][c]=data[r][nextc];
          data[r][nextc]=0;
          this.setData({
            data:data
          })
          c--;
        }else if(data[r][c]==data[r][nextc]){
        //否则，如果data中r行c列等于nextc列的值
          //将c位置的值*2,值累加到score
          var score=this.data.score;
          score+=(data[r][c]*=2);
          data[r][nextc]=0;
          this.setData({
            data:data,
            score:score
          })
        }
      }
    }
  },
 //查找data中r行c列右侧下一个不为0的位置
  getNextInRow:function(r,c){
    //nextc从c+1开始，nextc到this.data.rows结束
    for(var nextc=c+1;nextc<this.data.rows;nextc++){
      if(this.data.data[r][nextc]!=0){
        return nextc;
      }
    }
    return -1;
  },
  moveRight:function(){
    var before=String(this.data.data);
    for(var r=0;r<this.data.rows;r++){
      this.moveRightInRow(r);
    }
    var after=String(this.data.data);
    this.compareBeforeAndAfter(before,after);
  },
  moveRightInRow:function(r){
    //c从CN-1开始，到>0结束，每次递减1
    for(var c=this.data.rows-1;c>0;c--){
      var prevc=this.getPrevInRow(r,c);
      if(prevc==-1){break;}
      else{
        var data=this.data.data;
        if(data[r][c]==0){
          //将prevc位置的值保存到c位置
          data[r][c]=data[r][prevc];
          data[r][prevc]=0;
          this.setData({
            data:data
          })
          c++;
        }else if(data[r][c] == data[r][prevc]){
        //否则，如果c位置的值等于prevc位置的值,将c位置的值*2
          var score=this.data.score;
          score+=(data[r][c]*=2);
          data[r][prevc]=0;
          this.setData({
            data:data,
            score:score
          })
        }
      }
    }
  },
  getPrevInRow:function(r,c){
    //prevc从c-1开始,prevc到>=0结束,每次递减1
    for(var prevc=c-1;prevc>=0;prevc--){
      if(this.data.data[r][prevc]!=0){
        return prevc;
      }
    }
    return -1;   
  },
  moveUp:function(){
    var before=String(this.data.data);
    for(var c=0;c<this.data.rows;c++){
      this.moveUpInCol(c);
    }
    var after=String(this.data.data);
    this.compareBeforeAndAfter(before,after);
  },
  moveUpInCol:function(c){
    //r从0开始，到<RN-1结束，每次增1
    for(var r=0;r<this.data.rows-1;r++){
      var nextr=this.getNextInCol(r,c);
      if(nextr==-1){break;}
      else{
        var data=this.data.data;
        if(data[r][c]==0){
          //将r位置的值改为nextr位置的值
          data[r][c]=data[nextr][c];
          data[nextr][c]=0;
          this.setData({
            data:data
          })
          r--;
        }else if(data[r][c]==data[nextr][c]){
        //否则，如果data中r行c列等于nextr列的值,将r位置的值*2
          var score=this.data.score;
          score+=(data[r][c]*=2);
          data[nextr][c]=0;
          this.setData({
            data:data,
            score:score
          })
        }
      }
    }
  },
  getNextInCol:function(r,c){
    //nextr从r+1开始，nextr到<RN结束,每次递增1
    for(var nextr=r+1;nextr<this.data.rows;nextr++){
      if(this.data.data[nextr][c]!=0){
        return nextr;
      }
    }
    return -1;
  },
  moveDown:function(){
    //保存格子移动前后的数据，并对比是否继续游戏
    var before=String(this.data.data);
    for(var c=0;c<this.data.rows;c++){
      this.moveDownInCol(c);
    }
    var after=String(this.data.data);
    this.compareBeforeAndAfter(before,after);
  },
  moveDownInCol:function(c){
    //r从RN-1开始，到>0结束，每次递减1
    for(var r=this.data.rows-1;r>0;r--){
      var prevr=this.getPrevInCol(r,c);
      if(prevr==-1){break;}
      else{
        var data=this.data.data;
        if(data[r][c]==0){
          //将prevr位置的值保存到r位置
          data[r][c] =data[prevr][c]
          data[prevr][c]=0;
          this.setData({
            data:data
          })
          r++;
        }else if(data[r][c] == data[prevr][c]){
        //否则，如果r位置的值等于prevr位置的值,将r位置的值*2
          var score=this.data.score;
          score+=(data[r][c]*=2);
          data[prevr][c]=0;
          this.setData({
            data:data,
            score:score
          })
        }
      }
    }
  },
  //查找r行c列上方前一个不为0的位置
  getPrevInCol:function(r,c){
    //prevr从r-1开始,prevr到>=0结束,每次递减1,并返回prevr位置的值不是0的prever
    for(var prevr=r-1;prevr>=0;prevr--){
      if(this.data.data[prevr][c]!=0){
        return prevr;
      }
    }

    return -1;
  },
  isGameOver:function(){
    //如果当前元素是0,或c<CN-1且当前元素等于右侧元素,或r<RN-1且当前元素等于下方元素，则游戏未结束,return false
    for(var r=0;r<this.data.rows;r++){
      for(var c=0;c<this.data.rows;c++){
        if(this.data.data[r][c]==0){
          return false;
        }
        if(c<this.data.rows-1 && this.data.data[r][c] == this.data.data[r][c+1]){
          return false;
        }
        if(r<this.data.rows-1 && this.data.data[r][c] == this.data.data[r+1][c]){
          return false;
        }
      }
    }
    
    this.setData({
      isShow:true,
      state:0
    });
    //保存游戏最高分
    if(this.data.score>this.data.topScore){
      wx.setStorageSync('topScore', this.data.score);
    }
    return true;
 },
  tryAgain:function(){
    console.log("try again");
    this.setData({
      isShow:false,
      state:1,
      score:0
    });
    this.start();
  },
  //判断格子移动前后的数据是否一样，不一样则生成一个随机数，并判断是否结束游戏
  compareBeforeAndAfter:function(before,after){
    if(before==after){ return }
    this.randomNum();
    this.isGameOver()
  },
  onShareAppMessage:function(){
    return {
      title: 'game 2048',
      path: '/pages/game/index',
      success: function(res) {
        // 分享成功
        console.log('share success',res);
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function(res) {
        // 分享失败
        console.log('share fail',res);
        if(res.errMsg.indexOf("cancel")!=-1){
          wx.showToast({
            title: '已取消分享',
            icon: 'success',
            duration: 2000
          })
        }else{
          wx.showToast({  
            title: '分享失败',
            icon: 'warn',
            duration: 2000
          })
        }
      }
    }
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})