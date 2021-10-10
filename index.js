const fs = require('fs');
const request = require('request');
const axios = require('axios');
main()

function main () {
    const emojis = getUrls()
    download(emojis)
}
// 获取所有地址并存储为一个json文件
function getUrls () {
    const data = JSON.parse(fs.readFileSync('panel.json', 'utf-8'));
    const emojis = data.data.all_packages.map(emojiList => {
        return {
            name: emojiList.text,
            emotes: emojiList.emote.map(emote => {
                return {
                    name: emote.text,
                    url: emote.url
                }
            })
        }
    })
    // console.log(emojis)
    fs.writeFile('res/emojis.json', JSON.stringify(emojis), (err) => {
        console.error(err)
    })
    return emojis
}
// 下载图片
function download (emojis) {
    emojis.forEach(emojiList => {
        // 分组下载
        fs.mkdir(`res/${emojiList.name}`, { recursive: true }, () => {
            const keyValue = {}
            if (emojiList.name !== '颜文字') {
                emojiList.emotes.forEach(emote => {
                    let url = emote.url;
                    url = url.replace('http://i0.hdslb.com/bfs/emote', `${emojiList.name}`);
                    keyValue[emote.name] = emote;
                    axios({
                        method: 'get',
                        url: emote.url,
                        responseType: 'stream'
                    }).then((response) => {
                        response.data.pipe(fs.createWriteStream(`res/${url}`, { autoClose: true })).on('close', function () {
                            console.log(`${emote.name}下载完成`)
                        })
                    }).catch(err => {
                        console.log(emote.name)
                    });
                })
                fs.writeFile(`res/${emojiList.name}/keyValue.json`, JSON.stringify(keyValue), (err) => {
                    console.error(err)
                })
            }
        })
    })
}