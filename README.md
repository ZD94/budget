# 鲸力商旅预算项目

### typescript 2.3.2

### 路由生成
```

    @Restful('/mountUrl')
    class ModelController {

        // GET /mountUrl/:id
        async get(req, res, next) {
        }

        // GET /mountUrl/
        async find(req, res, next) {
            let {page, perPage} = req.query;
        }

        // PUT /mountUrl/:id
        async update(req, res, next) {
        }

        // DELETE /mountUrl/:id
        async delete(req, res, next) {}

        //POST /mountUrl
        async add(req, res, next) {}

        @Router("/other", "GET")
        async other(req, res, next) {}
    }
```