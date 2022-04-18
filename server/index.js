const express = require('express')
const cors = require('cors')
const app = express()
const port = 8080;
const models = require('./models');
const multer = require('multer')

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
})

app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('uploads'))

app.get('/banners', (req, res) => {
    models.Banner.findAll({
        limit: 3
    }).then(result => {
        res.send({
            banners: result
        })
    }).catch(error => {
        console.error(error)
        res.status(500).send('에러가 발생했습니다.')
    })
})

app.get("/products", (req, res) => {
    models.Product.findAll({
        attributes: ["id", "name", "price", "createdAt", "seller", "imageUrl", "soldout"], //전체 조회 시 필요한 정보만 조회
    })
        .then((result) => {
            console.log("PRODUCTS : ", result)
            res.send({
                products: result
            })
        }).catch((err) => {
            console.error(error)
            res.send("에러 발생")
        })
    const query = req.query;
    console.log('query : ', query)

})

app.post("/products", (req, res) => {
    const body = req.body;
    const { name, price, seller, description, imageUrl } = body;

    if (!name || !description || !price || !seller || !imageUrl) {
        res.status(400).send("모든 필드를 입력해주세요.")
    }
    models.Product.create({
        name,
        description,
        price,
        seller,
        imageUrl
    }).then((result) => {
        console.log("상품 생성 결과: ", result);
        res.send({
            result,
        });
    }).catch((error) => {
        console.error(error)
        res.status(400).send('상품 업로드에 문제가 발생했습니다.')
    })
});

app.get("/products/:id", (req, res) => {
    const params = req.params;
    const { id } = params;
    models.Product.findOne({
        where: {
            id: id
        }
    }).then(result => {
        console.log("PRODUCT : ", result)
        res.send({
            product: result
        })
    }).catch(error => {
        console.error(error)
        res.status(400).send("상품 조회에 에러가 발생했습니다.")
    })
})

app.post('/image', upload.single('image'), (req, res) => {
    const file = req.file;
    console.log(file)
    res.send({
        imageUrl: file.path
    })
})

app.post("/purchase/:id", (req, res) => {
    const { id } = req.params
    models.Product.update(
        {
            soldout: 1
        },
        {
            where: {
                id: id
            },
        }
    )
        .then(result => {
            res.send({
                result: true
            })
        })
        .catch(error => {
            console.error(error)
            res.status(500).send("에러가 발생했습니다.")
        })
})

app.listen(port, () => {
    console.log('서버가 돌아가는 중입니다.')
    models.sequelize.sync().then(() => {
        console.log('DB연결 성공!')
    }).catch((err) => {
        console.error(err);
        console.log('DB연결 에러...')
        process.exit();
    })
}) 