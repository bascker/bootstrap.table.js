# bootstrap.table.js
基于 bootstrap 的 table 插件，便于后端开发人员进行操作.

## 依赖库
本组件的依赖库主要如下:
* jquery
* bootstrap-4.x
* font-awesome-4.x

## 配置
bootstrap.table.js 配置项具体如下
### caption
*string* 类型, 可选项, 若指定该值, 则会自动给 table 生成一个表格标题，说明表格的主要用途.

### columns
*array* 类型, 必选项, 数组每一个元素都是一个表格列的结构体.每个元素的属性如下:
* field: *string* 类型, 对应后台实体对象的属性名.
* caption: *string* 类型, 属性说明, 其值将作为`thead`的`th`值.
* editable: *boolean* 类型, 是否可编辑, 默认为 true.
* width: *number* 类型, 表格列的宽度.
* type: *string* 类型, 属性值的类型, 默认为 text, 目前支持 text|time|link.

### showOpField
*boolean* 类型, 可选项, 是否显示操作栏, 默认 true.

### showPagination
*boolean* 类型, 可选项, 是否显示分页操作栏, 默认 false.

### tooltip
*boolean* 类型, 可选项, 是否启动 bootstrap-tooltip, 默认 true.

### fadeToggle
*boolean* 类型, 可选项, 表格是否可折叠, 默认 false.
> 设置 caption 后, 才有效

### removeUrl
*string* 类型, 可选项, 删除操作触发时, ajax 请求的后台地址.
> 需与 removeExtra 选项搭配

### removeExtra
*object* 类型, 可选项, 删除操作触发时, 发送 ajax 请求时提交给后台的信息, 配置属性如下:
* field: 发送时, 对应后台的实体属性名, 删除操作一般指定使用 id.

### updateUrl
*string* 类型, 可选项, 更新操作触发时, ajax 请求的后台地址.

## 使用
通过定义一个`<table>`元素, 并在 JS 中传入配置和数据即可生成一个美观的、操作性强的表格。

1.定义一个`<table>`标签
~~~
<table id="table"></table>
~~~

2.编写 JS，修改默认配置，并传入表格数据
~~~
<script type="text/javascript">
  $(function () {
      var conf = {
          caption: '用户信息',
          columns: [
              {
                  field: 'id',
                  caption: 'ID',
                  editable: false,
                  width: 100
              },
              {
                  field: 'name',
                  caption: '姓名',
                  editable: true
              },
              {
                  field: 'birth',
                  caption: '出生日期',
                  type: 'time',
                  editable: false
              },
              {
                  field: 'github',
                  caption: 'Github',
                  type: 'link',
                  editable: true
              }
          ],
          fadeToggle: true
      };

      var data = [{
          "id": 0,
          "name": '救赎',
          'birth': '1996-06-06',
          'github': 'https://github.com/bascker/bootstrap.table.js'
      }, {
          "id": 1,
          "name": '贪狼',
          'birth': '1998-08-08',
          'github': 'https://github.com/bascker/bootstrap.table.js'
      }];

      $('#table').table(conf, data);
  });
</script>
~~~

具体案例请查看 [examples/index.html](examples/index.html)
