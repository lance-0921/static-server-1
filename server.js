var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url 
  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)
const session = JSON.parse(fs.readFileSync('./session.json').toString())
if(path==='/sign_in' && method === 'POST'){
    //从登录界面获取name、password，然后与数据库中进行比对
    response.setHeader('Content-Type','text/html;charset=utf-8')
    const userArray = JSON.parse(fs.readFileSync('./db/users.json'))
    const array = []
    request.on('data',(chunk)=>{
      array.push(chunk)
    })
    request.on('end',()=>{   
      const string = Buffer.concat(array).toString()   
      const obj = JSON.parse(string)  //name  password
      const user = userArray.find((user)=>user.name===obj.name && user.password===obj.password)
      if(user===undefined){
        response.statusCode = 400
        response.end(`{"errorCode":4001}`)
      }else{
        response.statusCode = 200;
        const random = Math.random()
        console.log(random)
        session[random] = {user_id: user.id}
        fs.writeFileSync('./session.json', JSON.stringify(session))
        response.setHeader("Set-Cookie", `session_id=${random}; HttpOnly`);
      }
      response.end()
    })
}else if(path==='/home.html'){
    const cookie = request.headers['cookie'] 
    let sessionId 
    try{
      sessionId =cookie.split(';').filter(s=>s.indexOf('session_id')>=0)[0].split('=')[1] 
    }catch(error){}
    //console.log(userId)
    if(sessionId && session[sessionId]){   
      const userId = session[sessionId].user_id
      const userArray = JSON.parse(fs.readFileSync('./db/users.json'))
      const user = userArray.find(user=>user.id===userId)
      const homeHtml = fs.readFileSync("./public/home.html").toString()
      let string = '' 
      if(user){   //显示用户名
        string = homeHtml.replace('{{loginStatus}}','已登录').replace('{{user.name}}',user.name)
      }else{
        string = homeHtml.replace('{{loginStatus}}','未登录').replace('{{user.name}}','')
      }
      response.write(string)
    }else{
      const homeHtml = fs.readFileSync("./public/home.html").toString()
      const string = homeHtml.replace('{{loginStatus}}','未登录').replace('{{user.name}}','')
      response.write(string)
    }
    response.end()
}else if(path==="/register" && method === 'POST'){   
    //从用户发送的请求中获取用户名、密码
    response.setHeader('Content-Type','text/html;charset=utf-8')
    const userArray = JSON.parse(fs.readFileSync('./db/users.json'))
    const array = []
    request.on('data',(chunk)=>{
      array.push(chunk)
    })
    request.on('end',()=>{   //监听请求的数据，如果请求的数据结束了，就打印出来
     
      const string = Buffer.concat(array).toString()   //将utf-8编码转换为字符串
      const obj = JSON.parse(string)
     // console.log(obj)
     const lastUser = userArray[userArray.length-1]
      const newUser = {id:lastUser ? lastUser.id+1 : 1,
      name:obj.name,
      password:obj.password
    }
      //将name、password写入数据库
      userArray.push(newUser)
      fs.writeFileSync('./db/users.json',JSON.stringify(userArray))
      response.end()
    })
   
   
}else{
    response.statusCode = 200
    //默认根目录
    const filePath = path ==='/' ? 'index.html' : path
    //返回指定元素在数组中的最后一个的索引
    const index = filePath.lastIndexOf('.')  
    //substring()返回从'.'之后的字符串子集 
    const suffix = filePath.substring(index)
    let fileType={
        '.html': 'text/html',
        '.js' : 'text/javascript',
        '.css' : 'text/css',
        '.img' : 'image/png',
        '.png' : 'image/jpeg'
    }
    //输入文件名不存在则保底为html
    response.setHeader('Content-Type', `${fileType[suffix] || 'text/html'};charset=utf-8`)
    
    let content
    //处理输入文件名不存在的情况，避免服务器挂掉
    try{  
        content = fs.readFileSync(`./public/${filePath}`)
    }catch(error){  
        content = `文件不存在`
        response.sendDate = 404
    }
    response.write(content)
    response.end()
  
}
    

  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)