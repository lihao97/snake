$(function(){
	function Snake() {
		var _this = this;
		_this.h = 30;	//地图的高度height和宽度wide。
		_this.w = 40;
		_this.style_copy = $("style").html();	//copy原style
		_this.score_target = $("#map .score");	//修改特定class元素的html记录分数。
		_this.allscore_flag = false;	//分数记录是否显示
		_this.resize = null;	//礼貌性的写一个。设置窗口resize事件延迟。
		_this.cookie_name = "llh_snake";
		_this.data_cookie = getCookie(_this.cookie_name);
		_this.data_timestamp = 0; //礼貌性的写一个。记录游戏开始的时间戳。
		_this.map_init = function(){	//地图、轮盘、蛇重新初始化
			_this.inW = $(window).width();
			_this.inH = $(window).height();
			_this.shuping_flag = _this.inW<_this.inH ? true : false;//是否竖屏，竖屏的话，将内容横向。
			_this.map_x = _this.shuping_flag ? _this.h : _this.w;
			_this.map_y = _this.shuping_flag ? _this.w : _this.h;
			_this.grid = _this.shuping_flag ? //高为短边，宽为长边。如果高过窄，则格子依高/20。
				(parseInt(_this.inH*0.76/_this.w)*_this.h > _this.inW ? parseInt(_this.inW/_this.h) : parseInt(_this.inH*0.76/_this.w)) : 
				(parseInt(_this.inW*0.76/_this.w)*_this.h > _this.inH ? parseInt(_this.inH/_this.h) : parseInt(_this.inW*0.76/_this.w));
			//对要生成的节点，直接设置其Style，比每次创建节点后再设置其css效率更高
			$("style").html(`
				${_this.style_copy}
				#map .snake,#map .food{
					width: ${_this.grid}px;
					height: ${_this.grid}px;
					border-radius: ${_this.grid/2}px;
				}
				#map .allscore li{
					width: ${parseInt(_this.grid*10)}px;
					height: ${parseInt(_this.grid*1.3)}px;
					font-size: ${parseInt(_this.grid*1)}px;
					line-height: ${parseInt(_this.grid*1.3)}px;
				}
			`);
			$(".center").css({
				left : _this.shuping_flag ? "50%": "38%",
				top : _this.shuping_flag ? "38%": "50%"
			});
			$(".right").css({
				left : _this.shuping_flag ? "50%": "87%",
				top : _this.shuping_flag ? "87%": "50%"
			});
			$("#map").css({
				width : _this.shuping_flag ? _this.grid*_this.h: _this.grid*_this.w,
				height : _this.shuping_flag ? _this.grid*_this.w: _this.grid*_this.h,
				marginTop: _this.shuping_flag ? -_this.grid*_this.w/2: -_this.grid*_this.h/2,
				marginLeft: _this.shuping_flag ? -_this.grid*_this.h/2: -_this.grid*_this.w/2
			});
			$("#map .score").css({
				transform: _this.shuping_flag ? "rotate(90deg)": "",
				width: parseInt(_this.grid*3.7),
				height: parseInt(_this.grid*1.7),
				fontSize : parseInt(_this.grid*1.2),
				marginTop: -parseInt(_this.grid*2)/2,
				marginLeft: -parseInt(_this.grid*3.7)/2,
			});
			$("#map .allscore").css({
				width: parseInt(_this.grid*24),
				height: parseInt(_this.grid*14),
				marginTop: -parseInt(_this.grid*14)/2,
				marginLeft: -parseInt(_this.grid*24)/2,
				transform:  _this.shuping_flag ? "rotate(90deg)": ""
			});
			$("#map .allscore h1").css({
				fontSize : parseInt(_this.grid*1.8),
			});
			$("#map .allscore ul").css({
				marginLeft: parseInt(_this.grid*0.5),
			});
			$("#roulette").css({
				width: parseInt(_this.grid*8.88),
				height: parseInt(_this.grid*8.88),
				marginTop: - parseInt(_this.grid*8.88/2),
				marginLeft: - parseInt(_this.grid*8.88/2),
			});
			_this.original();
		};
		_this.original = function() {	//设定初始值;
			_this.body = _this.shuping_flag ? [{x:_this.h-1,y:2},{x:_this.h-1,y:1},{x:_this.h-1,y:0}] : [{x:2,y:0},{x:1,y:0},{x:0,y:0}];
			_this.direction_pre = _this.shuping_flag ? "down" : "right";	//记录上一次移动
			_this.direction = _this.shuping_flag ? "down" : "right";	//记录上一次移动
			clearInterval(_this.timer);
			_this.timer = null;		//循环的名称
			_this.data_timestamp = 0;	//记录游戏开始时间
			_this.start_flag = false; //蛇是否运动中
			_this.speed = 300;		//蛇是运动的时间间隔
			_this.score_num = 3;	//记录分数
			_this.gameover = "别走神，再来一波~";//游戏结束提示语
			_this.display();//通过_this.body坐标刷新蛇
			_this.food();//随机坐标生成食物
			_this.score(_this.score_num);//分数同步到页面
		};
		_this.score = function (num) {	//计算分数，若传值则设置页面为该值。若无参数，则_this.score_num+1，并设置页面。
			if(arguments.length > 0){
				_this.score_target.html(num);
			}else {
				_this.score_target.html(++_this.score_num);
				_this.speed = Math.round(472.78*1/ Math.pow(parseInt(_this.score_target.html()),0.516));//蛇的速度：刷新间隔递减函数
				switch (parseInt(_this.score_target.html())) {
					case 5: _this.upgrade("还没开始你就结束了？");break;
					case 8: _this.upgrade("相信自己，你可以更持久的~");break;
					case 13: _this.upgrade("相信自己，你可以更持久的~");break;
					case 40: _this.upgrade("定个小目标，先及格(60)！");break;
					case 60: _this.upgrade("加油~~~~你已经很牛x了！");break;
					case 80: _this.upgrade("还是人吗？？？");break;
					case 100: _this.upgrade("强无敌，突破人类极限！");break;
					case 135: _this.upgrade("快不快？");break;
					case 150: _this.upgrade("蛇太长？");break;
					case 155: _this.upgrade("蛇太长？");break;
					case 165: _this.upgrade("蛇太长？");break;
				};
			}
		};
		_this.upgrade = function (content) {	//提升难度(提高speed)，以及更新gameover提示语。
			_this.gameover = content;
			clearInterval(_this.timer);
			_this.timer = setInterval(function(){_this.run()},_this.speed);
		};
		_this.display = function() {		//根据_this.body创建蛇。
			$("#map .snake").remove();
			for(var i=0;i<_this.body.length;i++){	
				if(_this.body[i].x != null) {
					var node = "<div class='snake snake" + i +"'><div>";
					$(node).appendTo($("#map"));
					$("#map .snake" + i).css({
						top: _this.body[i].y * _this.grid,
						left: _this.body[i].x * _this.grid,
					});
				}
			};
		};
		_this.food = function () {	//随机生成食物
			$("<div class='food'><div>").appendTo($("#map"));
			_this.foodx = Math.floor(Math.random()*_this.map_x);
			_this.foody = Math.floor(Math.random()*_this.map_y);
			for (var i=0;i<_this.body.length;i++){	//避免重复，重复就重新随机一个食物。
				if(  (_this.foodx == _this.body[i].x) && (_this.foody == _this.body[i].y) && (_this.body.length < _this.map_x*_this.map_y-1) ) {
					return arguments.callee();
				}
			}
			$("#map .food").css({
				top: _this.foody * _this.grid,
				left: _this.foodx * _this.grid
			});
		};
		_this.run = function () {	//运动，每次运动都是修改坐标再重新生成蛇。
			if(_this.data_timestamp == 0){
				_this.data_timestamp = new Date().getTime();
			}
			for(var i=_this.body.length-1;i>0;i--){	//蛇的上一节身体到下一节身体的位置（蛇头另外处理）。
				_this.body[i].x = _this.body[i-1].x;
				_this.body[i].y = _this.body[i-1].y;
			};
			switch(_this.direction) {	//蛇头移动
				case "right": _this.body[0].x +=1;break;
				case "left" : _this.body[0].x -=1;break;
				case "up": _this.body[0].y -=1;break;
				case "down" : _this.body[0].y +=1;break;
			};
			_this.direction_pre = _this.direction;	// direction_pre记录 每次头部根据snake.direction运动方向。
			//出界
			if(_this.body[0].x > _this.map_x-1 || _this.body[0].x < 0 || _this.body[0].y > _this.map_y-1 || _this.body[0].y < 0 ){
				_this.end();
			}
			//吃到自己 
			for (var j=4;j<_this.body.length;j++){
				if(  (_this.body[0].x == _this.body[j].x) && (_this.body[0].y == _this.body[j].y)  ) {
					_this.end();
				}
			}
			//吃到食物
			if(_this.body[0].x == _this.foodx && _this.body[0].y == _this.foody){
				_this.body.push({x:null,y:null});
				$("#map .food").remove();
				_this.food();
				_this.score();
			}
			_this.display();
		};
		_this.snake_dir = function(dir){	//判定方向
			if(_this.start_flag){
				switch (dir) {		//按键方向与上次一蛇头运动方向对比（不能与本身的对比，不然按得快就gg）。
					case "left" : 
						if(_this.direction_pre != "right"){
							_this.direction = "left";
						};break;
					case "up" : 
						if(_this.direction_pre != "down"){
							_this.direction = "up";
						};break;
					case "right" : 
						if(_this.direction_pre != "left"){
							_this.direction = "right";
						};break;
					case "down" : 
						if(_this.direction_pre != "up"){
							_this.direction = "down";
						};break;
				};
			};
		};
		_this.startOrpause = function(){	//开始或暂停
			if(!_this.start_flag){
				_this.start_flag = true;
				_this.timer = setInterval(function(){_this.run()},_this.speed);
			}else {
				_this.start_flag = false;
				clearInterval(_this.timer);
			}
		};
		_this.end = function(){
			alert("游戏结束，您获得" +_this.score_num+"分，\n"+_this.gameover);
			if(_this.data_cookie.split("&").length <= 30){
				_this.data_cookie = _this.data_cookie + _this.data_timestamp + "-" + _this.score_num + "&";
			}else {
				_this.data_cookie = _this.data_cookie.substring(_this.data_cookie.indexOf("&") +1) + _this.data_timestamp + "-" + _this.score_num + "&";
			};
				setCookie(_this.cookie_name,_this.data_cookie,7);
			_this.original();
		};
		_this.loadCookie = function(){
			if(_this.data_cookie != ""){
				var arr_temp = _this.data_cookie.split("&");
				arr_temp.length = arr_temp.length-1;
				if(arr_temp.length == 30){
					$("#map .allscore ul").html("");
				};
				for(let i=$("#map .allscore ul li").size()/2;i<arr_temp.length;i++){
					let time_obj = new Date(parseInt(arr_temp[i].substring(0,13)));// 13位"-"的引索，timestamp为13位(包括毫秒)。
					let time_cn  = units_add_zero(time_obj.getMonth()) + "月" + units_add_zero(time_obj.getDate()) + "日 " + units_add_zero(time_obj.getHours()) + ":" + units_add_zero(time_obj.getMinutes()) + ":" + units_add_zero(time_obj.getSeconds());
					let score = arr_temp[i].substring(13+1);
					$("#map .allscore ul").html($("#map .allscore ul").html() + "<li class='a_s'>" + time_cn + "</li><li class='a_s'><strong class='a_s'>" + score + "分</strong></li>");
				};
			};
		};
	};
	var snake = new Snake();
	snake.map_init();
	// setCookie(_this.cookie_name,"",-1);
	$(document).keydown(function(e){
		switch (e.keyCode) {
			case 37 : 
				snake.snake_dir("left");break;
			case 38 : 
				snake.snake_dir("up");break;
			case 39 : 
				snake.snake_dir("right");break;
			case 40 : 
				snake.snake_dir("down");break;
			case 32 :
				snake.startOrpause();break;
		};
	}).click(function(e){
		if(!snake.allscore_flag){
			var roulette_center = {x:snake.inW*parseInt($(".right").get(0).style.left)/100,y:snake.inH*parseInt($(".right").get(0).style.top)/100};
			var click_point = {x:e.clientX,y:e.clientY};
			if(tow_points(roulette_center,click_point,"s")<$("#roulette").width()*1.5/2){//轮盘，提高1.5倍距离，增加用户体验。
				snake.snake_dir(tow_points(roulette_center,click_point));
			}else {	//外边
				snake.startOrpause();
			}
			roulette_center = null;
			click_point = null;
		}else if(e.target.className.indexOf("a_s") == -1){
			$("#map .allscore").fadeOut();
			snake.allscore_flag = false;
		}
	});
	$("#map .score").click(function(e){
		e.stopPropagation();
		if(snake.start_flag){
			snake.startOrpause();
		}
		snake.allscore_flag = true;
		$("#map .allscore").fadeIn();
		snake.loadCookie();
	});
	$(window).resize(function(){
		clearTimeout(snake.resize);
		snake.resize = setTimeout(function(){
			snake.map_init();	//地图、轮盘、蛇重新初始化
		},300);
	});
	function tow_points(start,end) {	//计算{x:_,y:_}两点的方向或距离
		if(arguments.length > 2){
			return Math.sqrt(Math.pow(start.y - end.y,2) + Math.pow(start.x - end.x,2),2)
		}
		var k = (start.y-end.y)/(start.x-end.x);
		if(k>1 || k<-1){
			return end.y - start.y > 0 ? "down" : "up";
		}else if(k<1 && k>-1) {
			return end.x - start.x > 0 ? "right" : "left";
		}
	};
	function units_add_zero(num){	//对齐2位数，将0-9 前面加上0，变成00,01,02...09
		return (Math.round(num).toString().length == 1) ? ("0" + Math.round(num)) : Math.round(num);
	}
	// 设置cookie
	function setCookie(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		var expires = "expires=" + d.toUTCString();
		document.cookie = cname + "=" + cvalue + "; " + expires+"; path=/"   //这个很重要代表在那个层级下可以访问cookie
	}
	// 获取cookie
	function getCookie(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while(c.charAt(0) == ' ') c = c.substring(1);
			if(c.indexOf(name) != -1) return c.substring(name.length, c.length);
		}
		return "";
	}
	// 删除 cookie
	function clearCookie(name) {
		setCookie(name, "", -1);
	}
});