
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const path = require('path')
 

// app.use('/public', express.static('public'));
app.use(express.static('public'))
app.get('/', function(req, res){
    console.log(__dirname)
    res.redirect('/public/index.html');
});
// app.use(express.static(path.join(__dirname, 'public')))
let onlineUsers = {};
let onlineCount = 0;
io.on('connection',function(socket){
    console.log('a use connection');
    
    //监听新用户加入
    socket.on('login',function(obj){
        console.log(obj)
        socket.name = obj.userid;
        if(!onlineUsers[obj.userid]){
            onlineUsers[obj.userid]=obj.username;
            onlineCount++;
        }
        io.emit('login',{onlineUsers:onlineUsers,onlineCount:onlineCount,user:obj})
        console.log(obj.username+' 加入了聊天室')
    })
    //监听用户退出
    socket.on('disconnect',function(){
        if(onlineUsers.hasOwnProperty(socket.name)){
            var obj = {userid:socket.name, username:onlineUsers[socket.name]};
             
            //删除
            delete onlineUsers[socket.name];
            //在线人数-1
            onlineCount--;
             
            //向所有客户端广播用户退出
            io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
            console.log(obj.username+'退出了聊天室');
        }
    })

    //监听用户发布聊天内容
    socket.on('message', function(obj){
        //向所有客户端广播发布的消息
        io.emit('message', obj);
        console.log(obj.username+'说：'+obj.content);
    });

})

http.listen(3000, function(){
    console.log('listening on *:3000');
})

