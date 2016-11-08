var	express = require('express');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var gm = require('gm');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var iconv = require('iconv-lite');
iconv.skipDecodeWarning = true;
var main = {};
var footprint = [];
var getFiles = {
    nowUrl:'',
    allFiles:[],
    imgs: [],
};
var collagesAll = [];
var imgsPath = '';
var sourceExePath = path.resolve(__dirname, '../')+ '\\exe';
var sourcePath = path.resolve(__dirname, '../')+ '\\public\\txt';
var resultPath = path.resolve(__dirname, '../')+ '\\public\\resultxt';

var progress = 0;
var total = 0;

main.index = (req, res) => {
    deleteFiles('public/txt');
    res.render("index");
}

/**
 * 进入某个文件夹，并对文件夹的图片进行压缩和复制
 */
main.getAllDrive = (req, res) => {
    deleteFiles('public/resultxt');
    req.setTimeout(6000000, function () {
        console.log("请求超时。");
    });
    res.setTimeout(600000000,function(){
        console.log("响应超时.");
    });
    progress = 0;
    getFiles = {
        nowUrl:'',
        allFiles:[],
        imgs: [],
    };
    if (req.query.url) {
        var type = req.query.type;
        if (type) {
            var url = req.query.url.trim();
            getFiles.nowUrl = url;
        } else {
            var url = req.query.url.trim();
            url = url + '\\';
            getFiles.nowUrl = url;
        }
        getAllFiles(url, getClientIP(req), type);
        total = getFiles.imgs.length;
        progress = 0;
        (async(
            function  () {
                let imgAll = isImg('public/static/'+ getClientIP(req));
                // for (let i = 0; i < getFiles.imgs.length; i++) {
                //     await(cutImg(getFiles.imgs[i].copyPath , 'public' + getFiles.imgs[i].cutpath));
                //     console.log("************已压缩一张图片******************");
                //     await(copyImg(getFiles.imgs[i].copyPath, 'public' + getFiles.imgs[i].changePath));
                //     console.log("************已复制一张图片******************");
                //     progress ++;
                // }
                if (imgAll) {
                    for (let i = 0; i < imgAll.length; i++) {
                        await(cutImg(imgAll[i].copyPath , 'public' + imgAll[i].cutpath));
                        console.log("************已压缩一张图片******************");
                        await(copyImg(imgAll[i].copyPath, 'public' + imgAll[i].changePath));
                        console.log("************已复制一张图片******************");
                        progress ++;
                    }
                }
                if (getFiles.imgs.length > 0 ) {
                    console.log("所有图片复制完成！");
                }
                res.send(getFiles);
                return false;
            }
        ))();
        return false;
    } else {
        getAllSys(req).then(() => {
            res.send(getFiles);
        })
    }
}

/**
 * 通过调用 caffe-test-StructDocImg.exe 自动对图片进行分类
 * 传入参数 所有图片路径的txt、 对图片进行分类的结果txt
 * 图片类型：结构型、非结构型、异常型
 *  */
main.imgSort = (req, res) => {
    req.setTimeout(6000000, function () {
        console.log("请求超时。");
    });
    res.setTimeout(600000000,function(){
        console.log("响应超时.");
    });
    let folder = '';
    if (imgsPath == '') {
        res.send(getFiles);
        return false;
    }
    let url = '';
    if (!req.query.url) {
        return false;
    }
    url = req.query.url.trim();    
    console.log("开始图片分类...");
    if (!fs.existsSync('public/resultxt')) {
        fs.mkdirSync('public/resultxt');
    }

    var randomNumber = getClientIP(req);
    var exe = exec(sourceExePath + '\\caffe-test-StructDocImg.exe '+ sourcePath + '\\'+ randomNumber +'.txt ' + resultPath + '\\' + randomNumber + '.txt');
    exe.stdout.on('data', function(data) {});
    exe.stderr.on('data', function(data) {});
    exe.on('close', function(code) {   
        // 读取resultTxt
        var fileContent = fs.readFileSync(resultPath + '\\' + randomNumber + '.txt', 'utf8');
        fileContent = fileContent.split('\r\n');
        fileContent.pop();
        // 去读图片地址的txt
        var readPictures = fs.readFileSync(sourcePath + '\\' + randomNumber + '.txt');
        readPictures = iconv.decode(readPictures, 'GBK');
        readPictures = readPictures.split('\r\n');
        readPictures.pop();
        
        if (readPictures.length == fileContent.length) {
            let imgInfomation = [];
            for (let i = 0; i < fileContent.length; i++) {
                let collImg = {};
                let oneImg = fileContent[i].split('\t');
                let imgname = readPictures[i].split('\\');
                let cimgname = imgname[imgname.length-1];

                collImg.path = cimgname;
                imgname.splice(imgname.length-1, 1);
                imgname = imgname.join('\\');

                if (url == (imgname + '\\')) {
                    collImg.abPath = '/static/'+ randomNumber +'/'+ cimgname;
                    collImg.cutpath = '/static/'+ randomNumber +'/small/' + cimgname;
                    collImg.changePath =  '/static/'+ randomNumber +'/'+ cimgname;
                } else {
                    folder = imgname.substring(url.length, imgname.length);
                    collImg.abPath = '/static/'+ randomNumber +'/' + folder +'/'+ cimgname;
                    collImg.cutpath = '/static/'+ randomNumber + '/small/'+ folder +'/' + cimgname;
                    collImg.changePath =  '/static/'+ randomNumber +'/' + folder +'/'+ cimgname;
                }
                collImg.type = oneImg[0];
                collImg.prob = oneImg[1];
                imgInfomation.push(collImg);
            }
            collagesAll = imgInfomation;
            let collagesImg = imgSortResult(url, imgInfomation);
            console.log('所有图片分类完成!');
            res.send(collagesImg);
        } 
    });
}

/**
 * 如果用户对程序自动分类的图片不满意，可以手动进行修改图片的类型
 * 用户可以将结构型图片重新归类到非结构型中， 反之，非结构性图片也可以重新归类到结构型中
 */
main.imgSortByH = (req, res) => {
    let imgPath = req.query.path;
    if (!imgPath) {
        return false;
    }

    let collagesImg = collagesAll;
    if (imgPath instanceof Array) {
        for (let i = 0; i < collagesImg.length; i++) {
            for (let j = 0; j < imgPath.length; j++) {
                if (collagesImg[i].cutpath == imgPath[j]) {
                    collagesImg[i].prob = 1.0;
                    collagesImg[i].type = (collagesImg[i].type == 1 ? 0 : 1);
                }
            }
        }
    } else {
        for (let i = 0; i < collagesImg.length; i++) {
            if (collagesImg[i].cutpath == imgPath) {
                collagesImg[i].prob = 1.0;
                collagesImg[i].type = (collagesImg[i].type == 1 ? 0 : 1);
            }
        }
    }

    res.send(imgSortResult(getFiles.nowUrl, collagesImg));
}

/**
 * 图片复制显示的进度条
 */
main.getProgress = (req, res) => {
    let sendProgress = {
        total: total,
        progress: progress,
    };
    res.send(sendProgress);
}

/**
 * 图片分类的进度条
 * 通过读取文件的方式获取程序执行进度
 */
main.getProgresssort = (req, res) => {
    let sendProgress = {
        total: 0,
        progress: 0,
    };
    let filename = 'public/resultxt/' + getClientIP(req) + '.txt';
    if (fs.existsSync(filename)) {
        let content = fs.readFileSync(filename);
        if (content) {
            content = iconv.decode(content, 'GBK');
            content = content.split('\r\n');
            content.pop();
            sendProgress.progress = content.length;
        } else {
            sendProgress.progress = 1;
        }
    } else {
       sendProgress.progress = 1;
    }
    res.send(sendProgress);
}


/**
 * 用户指定一张图片进行搜索
 * 在生成之前要调用 ReadImgListTxtOutputFeatFilesToy.exe 让每一张图片都生成一个特征文件，用户搜索时，程序会调用这些特征文件进行图片搜索
 * exe参入参数： 所有图片地址的txt
 */
main.imgSearch = (req, res) => {
    let imgUrl;
    let imgValue = req.query.value ? req.query.value : 0.5;
    let signal = true;
    let result;
    if (req.query.url) {
        imgUrl = path.resolve(__dirname, '../') + '\\public' + req.query.url.trim();
    }
    // 判断是否生成过特征文件
    let url = 'public/static/'+getClientIP(req);
    let content = fs.readdirSync(url);
    for (let f in content) {
        if (content[f].includes('.featZMtxt') && fs.statSync(url + '/' + content[f]).isFile()) {
            signal = false;
            break;
        }
    }
    // // 如果存在 resultSearch.txt  文件
    // if (fs.existsSync(resultPath + '\\resultSearch.txt')) {
    //     res.send(resultSearchFun(resultPath + '\\resultSearch.txt', imgValue));
    //     return false;
    // }

    // 如果没有生成特征文件调用EXE
    if (signal) {
        var exe = exec(sourceExePath + '\\ReadImgListTxtOutputFeatFilesToy.exe '+ resultPath +'\\featMTtxt.txt');
        exe.stdout.on('data', function(data) {});
        exe.stderr.on('data', function(data) {});
        exe.on('close', function(code) {
            (async(
                function  () {
                    result = await(searchEXE(imgUrl, imgValue));
                    res.send(result);
                }
            ))();
        });
    } else {
        (async(
            function  () {
                result = await(searchEXE(imgUrl, imgValue));
                res.send(result);
            }
        ))();
    }
}

/**
 * 调用图片搜索的EXE Test1ReadFeatFilesAndRetrieval.exe
 * 传入参数为：传入的参数为搜索的exe、所有图片地址、目标图片地址、区域值、搜索的结果、搜索结果数量
 */
function searchEXE (imgUrl, imgValue) {
    let imgAllUrl = resultPath +'\\featMTtxt.txt';
    let resultSearch = resultPath + '\\resultSearch.txt';
    let searchExePath = sourceExePath + '\\Test1ReadFeatFilesAndRetrieval.exe';
    let resultNum = resultPath + '\\searchNum.txt';
    return new Promise((resolve, reject) => {
        let exe = exec(searchExePath + ' ' + imgAllUrl + ' ' + imgUrl + ' ' + imgValue + ' ' + resultSearch + ' ' + resultNum);
        exe.stdout.on('data', function(data) {
            console.log(data);
        });
        exe.stderr.on('data', function(data) {
            console.log(data);
        });
        exe.on('close', function(code) {
            resolve(resultSearchFun(resultSearch, imgUrl, imgValue));
        });
    });
}

// 读取 resultSearch.txt 文件
function resultSearchFun (searchTxt, imgUrl, imgValue) {
    let resultData = [];
    let searchData = [];
    let resultList = '';
    if (!fs.existsSync(searchTxt)) {
        console.log(searchTxt + "不存在");
        return searchData;
    }
    let context = fs.readFileSync(searchTxt);
    context = iconv.decode(context, 'GBK');
    context = context.split('\r\n');
    context.pop();
    // 将搜索结果写入到文件中list.txt
    if (!fs.existsSync('public/resultxt/resultList.txt')) {
        fs.writeFileSync('public/resultxt/resultList.txt', '', 'utf8');
    }
    
    for (let i = 0; i < context.length; i++) {
        let oneObj = context[i].split('\t');
        if (imgValue >= oneObj[1]) {
            resultData.push({"path": path.parse(oneObj[0]).name});
        }
    }
    var imgs_s = getFiles.imgs;
    for (let i = 0; i < resultData.length; i++) {
        for (let j = 0; j < imgs_s.length; j++) {
            if (imgs_s[j].path.includes(path.parse(imgUrl).base)) {
                imgUrl = '目标图片：' + imgs_s[j].copyPath + '\r\n';
            }

            if (resultData[i].path.includes(imgs_s[j].path)) {
                resultList += imgs_s[j].copyPath + '\r\n';
                searchData.push(imgs_s[j]);
            }
        }
    }
    resultList = imgUrl + "域值："+ imgValue +"\r\n搜索结果：\r\n" +resultList;
    fs.appendFileSync('public/resultxt/resultList.txt', resultList, 'utf8');
    return searchData;
}

// 将结果图片分成结构型和非结构型
function imgSortResult (url ,imgInfomation) {
    let collagesImg = {
        nonStructImg:[],
        structImg: [],
    };
    let featMTtxt = '';
    let nonStructImg = '';
    let structImg = '';
    let exceptionImg = '';
    for (let i = 0; i < imgInfomation.length; i++) {
        if (imgInfomation[i].type == 1) {
            nonStructImg += url + imgInfomation[i].path+'\t'+imgInfomation[i].prob+'\r\n';
            collagesImg.nonStructImg.push(imgInfomation[i]);
        } else if (imgInfomation[i].type == 2) {
            exceptionImg += url + imgInfomation[i].path+'\t'+imgInfomation[i].prob+'\r\n';
            collagesImg.nonStructImg.push(imgInfomation[i]);
        } else {
            structImg += url + imgInfomation[i].path+'\t'+imgInfomation[i].prob+'\r\n';
            collagesImg.structImg.push(imgInfomation[i]);
            featMTtxt += path.resolve(__dirname, '../') + '\\public' + imgInfomation[i].changePath + '\r\n';
        }
    }
    // 将分类结果写入到txt 文件中
    fs.writeFileSync('public/resultxt/结构型.txt', structImg, 'utf8');
    fs.writeFileSync('public/resultxt/非结构型.txt', nonStructImg, 'utf8');
    fs.writeFileSync('public/resultxt/异常型.txt', exceptionImg, 'utf8');
    featMTtxt = featMTtxt.replace(/\//g, '\\'); 
    featMTtxt = iconv.encode(featMTtxt, 'GBK');
    fs.writeFileSync('public/resultxt/featMTtxt.txt', featMTtxt);
    return collagesImg;
}


/**
 * 通过调用系统命令 C:\\windows\\System32\\wbem\\wmic logicaldisk get caption 来获取该计算机的所有盘符
 */
function getAllSys(req) {
    return new Promise((resolve, reject) => {
        // var command = 'wmic logicaldisk get caption';
        var command = 'C:\\windows\\System32\\wbem\\wmic logicaldisk get caption';
        var exeCommand = exec(command, (error, stdout, stderr) => {
            if (error) {
                throw error;
            }
            if (stderr) {
                throw stderr;
            }
            var randomNumber = getClientIP(req);
            stdout = stdout.trim();
            stdout = stdout.split('\n');
            for (var i = 0; i < stdout.length; i++) {
                var file = {};
                file.isfile = true;
                file.path = stdout[i].trim();
                file.utime = '-';
                if (i > 0 ) {
                    getFiles.allFiles.push(file);
                }
            }
            resolve();
        });

        exeCommand.stdin.end();
    });
}

// 查看文件中是否存在图片
function isImg (url) {
    let imgAll = getFiles.imgs;
    var operImg = [];
    let allName = [];
    if (fs.existsSync(url)) {
        let contentImg = fs.readdirSync(url);
        for (let i in contentImg) {
            if (fs.statSync(url + '/' + contentImg[i]).isFile() == false && contentImg[i] != 'small') {
                isImg(url + '/' + contentImg[i]);
            } else {
                allName.push(url + '/' + contentImg[i] );
            }
        }
        
        for (let i in imgAll) {
            if (!allName.includes('public' + imgAll[i].changePath)) {
                operImg.push(imgAll[i]);
            }
        }
        return operImg
    } else {
        return operImg;
    }
}

/**
 * 采用递归的方式读取指定文件夹下的所有文件及文件夹
 * 并且过滤掉所有非图片文件，只显示图片文件，以及显示图片的大小、创建时间、图片名称、图片地址
 */
function getAllFiles(url, randomNumber, type) {
        footprint.push(url);
        let folder = '';
        if (!url) {
            return false;
        }

        if (type != 'all') {
             deleteFiles('public/static/' + randomNumber);
        }
        if (url == getFiles.nowUrl) {
            imgsPath = '';
        } else {
            folder = url.substring(getFiles.nowUrl.length, url.length);
            console.log(url);
        }
        var files = fs.readdirSync(url);
        var file = {};
        
        for (var i = 0; i < files.length; i++) {
            file = {};
            if (files[i] == 'System Volume Information' || files[i] == '$RECYCLE.BIN') {
                continue;
            }

            var stat = fs.statSync(url + files[i]);
            // 文件夹
            if (stat.isDirectory() == true) {
                if (type == 'all') {
                    getAllFiles(url + files[i] + '\\', randomNumber, type);
                } else {
                    file.isfile = stat.isDirectory();
                    file.path = files[i];
                    file.size = (stat.size / 1024).toFixed(1);
                    file.utime = stat.ctime;
                    getFiles.allFiles.push(file);
                    continue;
                }
            }
            // 操作图片文件
            var result = getFileName(files[i]);
            if (result) {
                file.isfile = stat.isDirectory();
                file.path = files[i];
                file.size = (stat.size / 1024).toFixed(1);
                file.utime = stat.ctime;
                if (folder) {
                    file.abPath = '/static/'+ randomNumber +'/' + folder + '/'+files[i];
                    file.cutpath = '/static/'+ randomNumber +'/small/'+ folder +'/'+ files[i];
                    file.changePath =  '/static/'+ randomNumber +'/' + folder + '/'+files[i];
                } else {
                    file.abPath = '/static/'+ randomNumber +'/'+files[i];
                    file.cutpath = '/static/'+ randomNumber +'/small/'+ files[i];
                    file.changePath =  '/static/'+ randomNumber +'/'+ files[i];
                }
                file.copyPath = url + files[i];
                getFiles.allFiles.push(file);
                getFiles.imgs.push(file);
                imgsPath += url + files[i] + '\r\n';
            }
        }

        if (!fs.existsSync('public/txt')) {
            fs.mkdirSync('public/txt');
        }

        if (imgsPath) {
            // 将图片地址写入文件
            var txt = 'public/txt/' + randomNumber + '.txt';
            var content = iconv.encode(imgsPath, 'GBK');
            fs.writeFileSync(txt, content);
        }

        // 创建存储图片的文件夹
        if (getFiles.imgs.length) {
            createFolders('public/static/' + randomNumber);
            createFolders('public/static/' + randomNumber + '/small');
        }
        if (folder) {
            createFolders('public/static/' + randomNumber + '/' + folder);
            createFolders('public/static/' + randomNumber + '/small/' + folder);
        }
}

// 创建多层文件夹
function createFolders (spath) {
    if (!fs.existsSync(spath)) {
        if (createFolders(path.dirname(spath))) {
            fs.mkdirSync(spath);
            return true;
        }
    } else {
        return true;
    }
} 

// 压缩图片
function cutImg (sourceP, newP) {
    return new Promise((resolve, reject) => {
        gm(sourceP).resize(100, 150).noProfile().write(newP, function (err) { 
            if (err) {
                throw err;
            } 
            resolve();
        });
    });
}

// 复制图片
function copyImg (sourcePath, staticpath) {
    return new Promise((resolve, reject) => {
        // var fileReadStream = fs.createReadStream(getFiles.nowUrl + getFiles.imgs[i].path);
        // var fileWriteStream = fs.createWriteStream('public/static/' + getFiles.imgs[i].path);
        var fileReadStream = fs.createReadStream(sourcePath);
        var fileWriteStream = fs.createWriteStream(staticpath);
        fileReadStream.on('data', function (chunk) {
            if(fileWriteStream.write(chunk) ==  false) {
                fileReadStream.pause();
            }
        }).on('end', function () {
            fileWriteStream.end();
            resolve();
        });

        fileWriteStream.on('drain', function () {
            fileReadStream.resume();
        });
    });
}

// 获取文件图片后缀
function getFileName(fileName){
    var result = {};
    var imgSuffix = ['.jpg', '.png','.bmp', '.tif'];
    fileName = fileName.toString().toLowerCase();
    var suffix =/\.[^\.]+/.exec(fileName);
    for (var i = 0; i < imgSuffix.length; i++) {
        if (imgSuffix[i] == suffix ) {
            return suffix;
        }
    }
    return null;
}


// 清空文件夹 
function deleteFiles (url) {
    if(fs.existsSync(url)) {
        var files = fs.readdirSync(url);
        for (var i = 0; i < files.length; i++) {
            var filePath = url + '/' + files[i];
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            } else {
                deleteFiles(filePath);
            }
        }
        fs.rmdirSync(url);
    } 
}

// 获取本机的IP地址
function getClientIP (req) {
    var ip = req.ip;
    if (ip == '::1') {
        ip = '127001';
    } else {
        ip = ip.substring(7, ip.length);
        ip = ip.split('.');
        ip = ip.join('');
    }
    return ip;
}

module.exports = main;