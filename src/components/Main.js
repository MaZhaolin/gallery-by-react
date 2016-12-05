require('normalize.css/normalize.css');
require('styles/App.scss');


import React from 'react';
import ReactDOM from 'react-dom';

// 获取图片相关的数据
let imageDatas=require('../data/imageDatas.json');
// 自执行函数 将图片信息转出图片URL路劲信息
imageDatas=(function getImageURL(imageDatasArr){
  for (let [i,singleImageData] of imageDatasArr.entries()) {
    singleImageData.imageURL=require('../images/'+singleImageData.filename);
    imageDatasArr[i]=singleImageData;
  }
  return imageDatasArr;
})(imageDatas);

/**
 * 获取区间内的随机值
 */
function getRangeRandom(low,high){
  return Math.floor(Math.random()*(high-low)+low);
}

class ImgFigure extends React.Component {

  constructor(props){
    super(props);

    this.handleClick=this.handleClick.bind(this);
  }

  /**
   * ImgFigure  的点击处理上函数
   */
  handleClick(e) {
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else {
      this.props.center();
    }

    e.stopPropagation();
    e.preventDefault();
  }

  render() {
    var styleObj={};

    //如果props属性中指定了这张图片的位置，则使用。
    if(this.props.arrange.pos){
      styleObj=this.props.arrange.pos;
    }

    var  imgFigureClassName = 'img-figure';
        imgFigureClassName += this.props.arrange.isInverse?' is-inverse':'';
    //如果图片的旋转角度有且不为0， 添加旋转角度
    if(this.props.arrange.rotate){
      (['Moz','Ms','Webkit','']).forEach(function(v){
        styleObj[v+'Transform']='rotate('+this.props.arrange.rotate+'deg)';
      }.bind(this));
    }

    if(this.props.arrange.isCenter){
      styleObj.zIndex=11;
    }

    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
        <img src={this.props.data.imageURL} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className="img-back" onClick={this.handleClick}>
            <p>{this.props.data.desc}</p>
          </div>
        </figcaption>
      </figure>
    )
  }
}

//控制组件
class ControllerUnit extends React.Component{
  constructor(props){
    super(props);

    this.handleClick=this.handleClick.bind(this);
  }
  handleClick(e){
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else {
      this.props.center();
    }
    e.preventDefault();
    e.stopPropagation();
  }
  render(){
    var ControllerUnitClassName='controller-unit';
    //如果对应的居中的图片，显示控制按钮的居中状态
    if(this.props.arrange.isCenter){
      ControllerUnitClassName +=' is-center';
      //如果同时是对的翻转图片，显示控制按钮的翻转态
      if(this.props.arrange.isInverse){
        ControllerUnitClassName += ' is-inverse';
      }
    }
    return (
      <span className={ControllerUnitClassName} onClick={this.handleClick}></span>
    );
  }
}

class AppComponent extends React.Component {
  constructor(props) {
      super(props);
      this.Constant = {
        centerPos:{
          left:0,
          right:0
        },
        hPosRange:{ //水平方向的去取值范围
          leftSecX:[0,0],
          rightSecX:[0,0],
          y:[0,0]
        },
        vPosRange:{ //垂直方向的取值范围
          x:[0,0],
          topY:[0,0]
        }
      };
      this.state = {
        imgsArrangeArr:[
          {
            /*pos:{
              left:'0',
              top:'0'
            },
            rotate:0, //旋转角度
            isInverse:false //图片正反面
            isCenter:false //是否居中
            */
          }
        ]};
  }


  //组件加载以后，为每张图片计算其位置的范围
  componentDidMount() {
    //首先拿到舞台的大小
    var stageDom=ReactDOM.findDOMNode(this.refs.stage),
        stageW=stageDom.scrollWidth,
        stageH=stageDom.scrollHeight,
        halfStageW=Math.ceil(stageW/2),
        halfStageH=Math.ceil(stageH/2);

    //拿到一个imageFigure的大小
    var imgFigureDom=ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW=imgFigureDom.scrollWidth,
        imgH=imgFigureDom.scrollHeight,
        halfImgW=Math.ceil(imgW/2),
        halfImgH=Math.ceil(imgH/2);

    //计算中心图片的位置点
    this.Constant.centerPos={
      left:halfStageW-halfImgW,
      top:halfStageH-halfImgH
    };

    //就算左侧,右侧区域图片排布位置的取值范围
    this.Constant.hPosRange = {
      leftSecX:[
        -halfImgH,
        halfStageW-halfImgW * 3
      ],
      rightSecX:[
        halfStageW+halfImgW,
        stageW-halfImgW
      ],
      y:[
        -halfImgH,
        stageH-halfImgH
      ]
    };

    //就算上侧区域图片排布未知的取值范围
    this.Constant.vPosRange = {
      topY:[
        -halfImgH,
        halfStageH - halfImgH * 3
      ],
      x:[
        halfStageW-imgW,
        halfStageW
      ]
    }

    this.rearrange(0);
  }

  /**
   * 翻转图片
   * @param index 输入当前被执行inverse操作图片对应的图片信息数组的index值
   * @return {Function} 这是一个闭包函数 ，其中return一个真正待被执行的函数
   */
   inverse(index){
     return function(){
       var imgsArrangeArr=this.state.imgsArrangeArr;

       imgsArrangeArr[index].isInverse=!imgsArrangeArr[index].isInverse;

       this.setState({
         imgsArrangeArr: imgsArrangeArr
       })
     }.bind(this);
   }
  /**
   * 重新布局所有图片
   * @param centerIndex 指定居中排布那个图片
   */
  rearrange(centerIndex) {
    var imgsArrangeArr=this.state.imgsArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = Constant.hPosRange,
        vPosRange = Constant.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,

        imgsArrangeTopArr=[],
        topImgNum=Math.floor(Math.random()*2), //取一个或不取
        topImgSpliceIndex=0,
        imgsArrangeCenterArr=imgsArrangeArr.splice(centerIndex,1);

        //首先居中 centerIndex 的图片
        imgsArrangeCenterArr[0]={
          pos: centerPos,
          rotate: 0,
          isCenter: true
        }

        //去除要布局上侧的图片状态信息
        topImgSpliceIndex=Math.ceil(Math.random*(imgsArrangeArr.length-topImgNum));
        imgsArrangeTopArr=imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

        //布局位于上侧的图片
        imgsArrangeTopArr.forEach(function(value,index){
          imgsArrangeTopArr[index] = {
            pos:{
                top:getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
                left:getRangeRandom(vPosRangeX[0],vPosRangeX[1])
              },
              rotate:getRangeRandom(-30,30),
              isCenter: false
          }
        })

        //布局左右两侧的图片
        for (let i = 0,j = imgsArrangeArr.length,k = j / 2; i < j; i++) {
          let hPosRangeLORX = null;
          //前半部分布局在左边,有半部分在布局右边
          if(i<k){
            hPosRangeLORX = hPosRangeLeftSecX;
          } else {
            hPosRangeLORX = hPosRangeRightSecX;
          }

          imgsArrangeArr[i] = {
            pos : {
              top : getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
              left : getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
            },
            rotate: getRangeRandom(-30,30),
            isCenter: false          }
        }

        if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
          imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr);
        }

        imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);

        this.setState({
          imgsArrangeArr:imgsArrangeArr
        })
  }

  /**
   * 利用rearrange函数，居中对应的index图片
   * @param index,需要被剧中的图片信息数组的index值
   * @return {Function}
   */

   center(index){
     return function(){
       this.rearrange(index);
     }.bind(this);
   }

  render() {
    let controllerUnits=[],
        imgFigures=[];
    imageDatas.forEach(function(value,index){

      if(!this.state.imgsArrangeArr[index]){
        this.state.imgsArrangeArr[index]={
          pos:{
            left:0,
            top:0
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        }
      }

      imgFigures.push(<ImgFigure key={index}  data={value} ref={'imgFigure'+index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);
      controllerUnits.push(<ControllerUnit key={index}    arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>)
    }.bind(this));
    return (
      <section  className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
