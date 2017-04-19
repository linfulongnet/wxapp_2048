// pages/game/index.js
Page({
  data:{
    gridSize:320,
    currentScore:0,
    grid:[],
    isShow:false,//是否显示游戏结束提示
    data:[],//二维数组，保存游戏的数据
    rows:4,//总行数
    cells:4,//总列数
    score:0,//保存当前得分
    topScore:0,
    top:0,//保存最高分
    state:1//保存游戏状态:0结束 1运行
  },
  start:function(){
    //game start
    console.log("game start");
     //调用API从本地缓存中获取最高分
    var topScore = wx.getStorageSync('topScore') || 0;
    wx.setStorageSync('topScore', topScore);
    //初始化数据二维数组
    var data=[];
    for(var r=0;r<this.data.rows;r++){
      //设置data中r行为[];
      data[r]=[];
      //c从0开始，到<CN结束，每次增1
      for(var c=0;c<this.data.rows;c++){
        //设置data中r行c列为0
        data[r][c]=0
      }
    }
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
      for(var c=0;c<this.data.cells;c++){
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
    //如果data中r行c列等于0
      if(this.data.data[r][c]==0){
      //将data中r行c列赋值为
        //随机生成一个小数<0.5?2:4
        var data=this.data.data;
        data[r][c]=Math.random()<0.5?2:4;
        this.setData({
          data:data
        });
        break;//退出循环
      }
    }
  },
  moveLeft:function(){//左移所有行
    //为data数组拍照，保存在before中
    var before=String(this.data.data);
    for(var r=0;r<this.data.rows;r++){
      this.moveLeftInRow(r);//左移第r行
    }
    //为data数组拍照，保存在after中
    var after=String(this.data.data);
    //如果before不等于after时
    if(before!=after){
      this.randomNum();
      //如果游戏结束,就修改游戏状态为GAMEOVER
      if(this.isGameOver()){
        this.setData({
           state:0
        });
     }
    }
  },
  moveLeftInRow:function(r){
    //左移第r行,从左到右遍历
    for(var c=0;c<this.data.rows-1;c++){
      var nextc=this.getNextInRow(r,c);
      if(nextc==-1){
        break;
      }else{
        //如果data中r行c列是0,将c位置的值改为nextc位置的值
        if(this.data.data[r][c]==0){
          //将nextc位置的值归0
          this.data.data[r][c]=this.data.data[r][nextc];
          this.data.data[r][nextc]=0;
          c--;
        }else if(this.data.data[r][c]==this.data.data[r][nextc]){
        //否则，如果data中r行c列等于nextc列的值
          //将c位置的值*2,值累加到score
          this.score+=(this.data.data[r][c]*=2);
          //将nextc位置的值归零
          this.data.data[r][nextc]=0;
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
  moveRight:function(){//右移所有行
    //为data拍照，保存在变量before中
    var before=String(this.data);
    //遍历data中每一行
    for(var r=0;r<this.RN;r++){
      this.moveRightInRow(r);//右移第r行
    }//(遍历结束)
    //为data拍照，保存在变量after中
    var after=String(this.data);
    //如果before不等于after
    if(before!=after){
      //随机生成数，更新界面
      this.randomNum();
      //如果游戏结束
      if(this.isGameOver()){
        //就修改游戏状态为GAMEOVER
        this.state=this.GAMEOVER;
      }
      this.updateView();
    }
  },
  moveRightInRow:function(r){//右移第r行
    //c从CN-1开始，到>0结束，每次递减1
    for(var c=this.CN-1;c>0;c--){
      //查找c位置左侧前一个不为0的位置prevc
      var prevc=this.getPrevInRow(r,c);
      //如果prevc等于-1，就退出循环
      if(prevc==-1){break;}
      else{//否则
        //如果c位置的值为0
        if(this.data[r][c]==0){
          //将prevc位置的值保存到c位置
          this.data[r][c]=
            this.data[r][prevc];
          //将prevc位置置为0
          this.data[r][prevc]=0;
          c++;//c留在原地
        }else if(this.data[r][c]==
                  this.data[r][prevc]){
        //否则，如果c位置的值等于prevc位置的值
          //将c位置的值*2
          this.score+=
            (this.data[r][c]*=2);
          //将prevc位置置为0
          this.data[r][prevc]=0;
        }
      }
    }
  },
  getPrevInRow:function(r,c){//查找r行c位置前一个不为0的位置
    //prevc从c-1开始,prevc到>=0结束,每次递减1
    for(var prevc=c-1;prevc>=0;prevc--){
      //如果prevc位置的值不是0
      if(this.data[r][prevc]!=0){
        return prevc;//返回prevc
      }
    }//(遍历结束)
    return -1;//返回-1    
  },
  moveUp:function(){//上移所有列
    //为data数组拍照，保存在before中
    var before=String(this.data);
    //c从0开始，到<CN结束
    for(var c=0;c<this.CN;c++){
      this.moveUpInCol(c);//上移第c列
    }//(遍历结束)
    //为data数组拍照，保存在after中
    var after=String(this.data);
    //如果before不等于after时
    if(before!=after){
      //随机生成一个数，更新界面
      this.randomNum();
      //如果游戏结束
      if(this.isGameOver()){
        //就修改游戏状态为GAMEOVER
        this.state=this.GAMEOVER;
      }
      this.updateView();
    }
  },
  moveUpInCol:function(c){//上移第c列
    //r从0开始，到<RN-1结束，每次增1
    for(var r=0;r<this.RN-1;r++){
      //查找r位置下方下一个不为0的位置nextr
      var nextr=this.getNextInCol(r,c);
      //如果nextr是-1，就退出循环
      if(nextr==-1){break;}
      else{//否则
        //如果data中r行c列是0
        if(this.data[r][c]==0){
          //将r位置的值改为nextr位置的值
          this.data[r][c]=
            this.data[nextr][c];
          //将nextr位置的值归0
          this.data[nextr][c]=0;
          r--;//r留在原地
        }else if(this.data[r][c]==
                   this.data[nextr][c]){
        //否则，如果data中r行c列等于nextr列的值
          //将r位置的值*2
          this.score+=
            (this.data[r][c]*=2);
          //将nextr位置的值归零
          this.data[nextr][c]=0;
        }
      }
    }
  },
  getNextInCol:function(r,c){//查找r行c列下方下一个不为0的位置
    //nextr从r+1开始，nextr到<RN结束,每次递增1
    for(var nextr=r+1;nextr<this.RN;nextr++){
      //如果data中nextr行c列不是0
      if(this.data[nextr][c]!=0){
        return nextr;//返回nextr
      }
    }//(遍历结束)
    return -1;//返回-1
  },
  moveDown:function(){//下移所有列
    //为data拍照，保存在变量before中
    var before=String(this.data);
    //遍历data中每一列
    for(var c=0;c<this.CN;c++){
      this.moveDownInCol(c);//下移第c行
    }//(遍历结束)
    //为data拍照，保存在变量after中
    var after=String(this.data);
    //如果before不等于after
    if(before!=after){
      //随机生成数，更新界面
      this.randomNum();
      //如果游戏结束
      if(this.isGameOver()){
        //就修改游戏状态为GAMEOVER
        this.state=this.GAMEOVER;
      }
      this.updateView();
    }
  },
  moveDownInCol:function(c){//下移第c列
    //r从RN-1开始，到>0结束，每次递减1
    for(var r=this.RN-1;r>0;r--){
      //查找r位置上方前一个不为0的位置prevr
      var prevr=this.getPrevInCol(r,c);
      //如果prevr等于-1，就退出循环
      if(prevr==-1){break;}
      else{//否则
        //如果r位置的值为0
        if(this.data[r][c]==0){
          //将prevr位置的值保存到r位置
          this.data[r][c]=
            this.data[prevr][c]
          //将prevr位置置为0
          this.data[prevr][c]=0;
          r++;//r留在原地
        }else if(this.data[r][c]==
                  this.data[prevr][c]){
        //否则，如果r位置的值等于prevr位置的值
          //将r位置的值*2
          this.score+=
            (this.data[r][c]*=2);
          //将prevr位置置为0
          this.data[prevr][c]=0;
        }
      }
    }
  },
  getPrevInCol:function(r,c){//查找r行c列上方前一个不为0的位置
    //prevr从r-1开始,prevr到>=0结束,每次递减1
    for(var prevr=r-1;prevr>=0;prevr--){
      //如果prevr位置的值不是0
      if(this.data[prevr][c]!=0){
        return prevr;//返回prevr
      }
    }//(遍历结束)
    return -1;//返回-1 
  },
  isGameOver:function(){
    for(var r=0;r<this.data.rows;r++){
      for(var c=0;c<this.data.rows;c++){
        //如果当前元素是0
        if(this.data.data[r][c]==0){
          return false;//就返回false
        }
        //如果c<CN-1且当前元素等于右侧元素
        if(c<this.data.rows-1 && this.data.data[r][c] == this.data.data[r][c+1]){
          return false;//就返回false
        }
        //如果r<RN-1且当前元素等于下方元素
        if(r<this.data.rows-1 && this.data.data[r][c] == this.data.data[r+1][c]){
          return false;//就返回false
        }
      }
    }
    
    this.setData({
      isShow:true,
      state:0
    });
    return true;//返回true
 },
  againBtn:function(){
    console.log("try again");
    this.setData({
      isShow:false
    });
    this.start();
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