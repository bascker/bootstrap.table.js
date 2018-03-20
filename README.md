# bootstrap.table.js
基于 bootstrap 的 table 插件，便于后端开发人员进行操作

## 依赖库
本组件的依赖库主要如下:
* jquery
* bootstrap-4.x
* font-awesome-4.x

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

具体案例请查看 examples/index.html
