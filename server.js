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
  

  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)