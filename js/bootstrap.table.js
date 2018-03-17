/**
 * Created by bascker on 2018/3/5.
 * 自定义 table 插件
 * 依赖库:
 *  1) bootstrap4.x
 */
(function ($) {
    function StringBuffer() {
        var self = this;
        self._strs = new Array();
    }

    StringBuffer.prototype = {
        append: function (str) {
            var self = this;
            self._strs.push(str);
            return self;
        },
        toString: function () {
            var self = this;
            return self._strs.join('');
        },
        clear: function () {
            var self = this;
            self._strs.splice(0, self._strs.length);
        }
    };

    var Tool = {
        isJson: function (str) {
            if (typeof str == 'string') {
                var obj = JSON.parse(str);
                if (typeof obj == 'object' && obj) {
                    return true;
                }
            }
            return false;
        },
        createField: function (obj) {
            if (typeof obj != 'object') {
                throw new Error('Param Error, The param obj is not a Object instance!');
            }
            return new Field(obj['field'], obj['caption'], obj['editable']);
        },
        setWidth: function (width) {
            return typeof width == 'undefined' ? '' : 'width="' + width + '"';
        },
        getOpHtml: function (op) {
            if (op.constructor != Operation) {
                throw new Error('Param Error, The op is not a Operation Instance!');
            }

            var _sb = new StringBuffer();
            _sb.append('<').append(op.tag).append(' class="').append(op.iconClass)
                .append('" title="').append(op.caption)
                .append('" data-toggle="tooltip" data-placement="top">')
                .append('</').append(op.tag).append('>');

            return _sb.toString();
        },
        getAjaxConf: function (url, data, success) {
            var conf = {
                type: "POST",
                url: url,
                contentType: "application/json;charset=uft-8",
                dataType: "json",
                data: JSON.stringify(data),
                success: success
            };

            return $.extend(true, {}, conf);
        }
        };

    var Operation = function (tag, iconClass, caption, url) {
        var self = this;
        self.constructor = Operation;
        self.tag = tag;
        self.iconClass = iconClass;
        self.caption = caption;
        self.url = url;
    };

    /**
     * Field: Table 的每一个列
     * @param name      提供给后台服务器，一般是后台实体属性名
     * @param caption   说明，提供给用户的说明性文字
     * @param type      类型，默认为 text, 可选 [text|password|link|img|time]
     * @param editable  是否可编辑
     */
    var Field = function (name, caption, editable, type) {
        var self = this;
        self.constructor = Field;
        self.name = name;
        self.caption = caption;
        self.editable = editable;
        self.type = (!type ? 'text' : type);
    };
    Field.prototype.toString = function () {
        var self = this;
        return JSON.stringify(self);
    };

    /**
     * Table
     * @param caption   表格名
     * @param fields    Field 数组
     * @param data      每一行的数据
     */
    var Table = function (caption, fields, data) {
        var self = this;
        self.constructor = Table;
        self.caption = caption;
        self.fields = fields;
        self._attrs = new Array();          // fieldNames, 用于 data 解析
        self.data = data;
    };
    Table.prototype = {
        options: {
            showOpField: false,         // 是否显示操作栏
            showPagination: false,      // 是否显示分页
            fadeToggle: false,          // 表单是否可折叠
            tooltip: true               // 是否启用 bootstrap-tooltip
        },
        getOpField: function () {
            var self = this,
                _default = new Field('ops', '操作', false);
            if (self.options.showOpField) {
                return _default;
            }

            return '';
        },
        defaultOps: function () {
            var _defaults = new Array();
            _defaults['edit'] = new Operation('a', 'bs-icon bs-edit fa fa-pencil', '编辑');
            _defaults['delete'] = new Operation('a', 'bs-icon bs-delete fa fa-trash', '删除');
            _defaults['update'] = new Operation('a', 'bs-icon bs-update fa fa-check', '保存');
            _defaults['cancel'] = new Operation('a', 'bs-icon bs-cancel fa fa-times', '取消');

            return _defaults;
        },
        _initCaption: function () {
            var self = this, _sb = new StringBuffer();
            _sb.append('<div class="card-header">').append(self.caption).append('</div>');
            return !self.caption ? '' : _sb.toString();
        },
        _initHeader: function () {
            var self = this, _sb = new StringBuffer();
            _sb.append('<thead  class="thead-dark"><tr>');
            self.fields.forEach(function (currentValue, index, array) {
                var field = currentValue;
                self._attrs.push(field.name);
                _sb.append('<th ').append(Tool.setWidth(field.width))
                    .append(' data-field="').append(field.name).append('">')
                    .append(field.caption).append('</th>');
            });
            // 操作
            if (self.options.showOpField) {
                var opField = self.getOpField();
                opField.width = 400;
                _sb.append('<th ').append(Tool.setWidth(opField.width))
                    .append(' data-field="').append(opField.name).append('">')
                    .append(opField.caption).append('</th>');
            }
            _sb.append('</thead>');

            return _sb.toString();
        },
        _initBody: function () {
            var self = this, _sb = new StringBuffer();
            self.data.forEach(function (currentValue, index, array) {
                var obj = currentValue;
                _sb.append('<tr>');
                self._attrs.forEach(function (currentValue, index, array) {
                    var attr = currentValue;
                    _sb.append('<td data-field="').append(attr).append('">');
                    switch (obj.type) {
                        case 'link':
                            _sb.append('<a class="bs-link" href="').append(obj[attr]).append('">').append(obj[attr]).append('</a>');
                            break;
                        case 'img':
                            break;
                        case 'select':
                            break;
                        case 'password':
                            _sb.append(obj[attr] + '<i class="bs-icon fa fa-eye pull-right" aria-hidden="true"></i>');
                            break;
                        case 'text':
                        case 'textarea':
                        case 'number':
                        case 'time':
                        default:
                            _sb.append(obj[attr]);
                    }
                    _sb.append('</td>');
                });

                if (self.options.showOpField) {
                    var defaultOps = self.defaultOps();
                    var opEdit = defaultOps['edit'], opDelete = defaultOps['delete'];
                    _sb.append('<td>');
                    _sb.append(Tool.getOpHtml(opEdit)).append(Tool.getOpHtml(opDelete));
                    _sb.append('</td>');
                }

                _sb.append('</tr>');
            });

            return _sb.toString();
        },
        _initFooter: function () {
            var self = this;
            if (self.options.showPagination) {
                var _sb = new StringBuffer();
                _sb.append('<tfoot><tr><td colspan="').append(self._attrs.length + 1).append('">')
                    .append('<nav aria-label="Page navigation">')
                    .append('<ul class="pagination justify-content-center" style="margin: 0">')
                    .append('<li class="page-item disabled"><a class="page-link" href="#">首页</a></li>')
                    .append('<li class="page-item"><a class="page-link" href="#" aria-label="Previous" data-toggle="tooltip" data-placement="top" title="上一页" aria-hidden="true"><span>&laquo;</span><span class="sr-only">Previous</span></a></li>')
                    .append('<li class="page-item"><a class="page-link active" href="#">1<span class="sr-only">(current)</span></a></li>')
                    .append('<li class="page-item"><a class="page-link" href="#">2</a></li>')
                    .append('<li class="page-item"><a class="page-link" href="#" aria-label="Next" data-toggle="tooltip" data-placement="top" title="下一页"><span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span></a></li>')
                    .append('<li class="page-item"><a class="page-link" href="#">尾页</a></li>')
                    .append('</ul></nav></td></tr></tfoot>');
                return _sb.toString();
            }

            return '';
        },
        extra: function () {
            var self = this;
            if (self.options.tooltip) {
                $("[data-toggle=tooltip]").tooltip();
            }
        },
        init: function () {
            var self = this, _sb = new StringBuffer();
            _sb.append('<div class="card">').append(self._initCaption())
                .append('<table class="bs-table table table-hover">')
                .append(self._initHeader())
                .append(self._initBody())
                .append(self._initFooter())
                .append('</table></div>');

            return _sb.toString();
        }
    };

    $.fn.table = function (option, data) {
        var $tb = this;
        // ----------------------------------
        // 参数检查
        // ----------------------------------
        var config = $.extend(true, {}, $.fn.table.defaults, option, {data: data});
        console.log(config);
        if (!config.columns) {
            throw new Error('Params Error!');
        }

        // ----------------------------------
        // 初始化表格
        // ----------------------------------
        var fields = new Array();
        config.columns.forEach(function (currentValue, index, array) {
            var obj = currentValue;
            fields.push(Tool.createField(obj));
        });
        var table = new Table(config.caption, fields, config.data);

        // 选项配置
        table.options.showOpField = config.showOpField;
        table.options.showPagination = config.showPagination;
        table.options.tooltip = config.tooltip;

        // HTML 生成
        $tb.append(table.init());

        // 额外效果
        table.extra();
    };

    $.fn.table.defaults = {
        caption: '',                    // 可选，表格说明
        columns: [],                    // 每一列的结构体, 必填
        showOpField: true,
        showPagination: false,
        tooltip: true,                  // 启用 bootstrap tooltip
        fadeToggle: true               // 是否可以折叠
    };

})(jQuery);