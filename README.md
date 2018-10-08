# library-server
# 1、安装
git clone https://github.com/wansj/library-server.git

cd /path/to/library-server

npm install
# 2、依赖
微服务：[UserService](https://github.com/wansj/UserService)

微服务：[UploadService](https://github.com/wansj/UploadService)

数据库：mongodb和redis
# 3、启动
首先启动数据库，可以将mongodb和redis安装为服务自动启动

启动微服务项目：UserService和UploadService

cd /path/to/UserService

npm run dev -- --port=4001(必须指定端口)

cd /path/to/UploadService

npm run dev -- --port=4000（必须指定端口）

cd /path/to/library-server

npm run dev
# 4、重要说明
（1）直接修改src/下面的文件不会起效，因为micro-dev使用的是dist/目录下面编译后文件，所以最好在webstorm中配置一个babel File Wather，这样当src/下面的源文件改动后会自动编译到dist目录下面。因为在项目源码中大量使用了es6语法，所以编译是必须的。

（2）开发模式下也可以指定UserService和UploadService运行在其他端口，但必须对应修改settings.js中remoteSchemaUrl和remoteSchemaUrl2为新的路径。部署的时候将remoteSchemaUrl和remoteSchemaUrl2设置为两个微服务部署的url
