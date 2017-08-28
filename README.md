# 鲸力商旅预算项目

### typescript 2.3.2

### 路由生成
```

    @Restful('/mountUrl')
    class ModelController {

        async get(req, res, next) {
        }

        async find(req, res, next) {
        }

        async update(req, res, next) {
        }

        async delete(req, res, next) {}

        async add(req, res, next) {}

        @Router("/other", "GET")
        async other(req, res, next) {}
    }
```