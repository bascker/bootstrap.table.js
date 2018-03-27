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
            var _field = new Field(obj['field'], obj['caption'], obj['editable'], obj['type']);
            if (typeof obj['width'] != 'undefined') {
                _field.width = obj['width'];
            }
            return _field;
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
        },
        isExist: function ($e) {
            return $e.length ? true : false;
        },
        classToggle: function ($e, from, to) {
            $e.removeClass(from).addClass(to);
        },
        tableSlideToggle: function ($table) {
            // 不能直接用 $table.slideToggle(), 会变成 display: block 变成 display: none 的效果
            $table.find('td').slideToggle();
            $table.find('th').slideToggle();
            $table.find('tr').slideToggle();
        }
    };

    /**
     * Modal: 模态框
     * @param id
     * @param label
     * @param title
     * @param body
     * @constructor
     */
    var Modal = function (id, label, title, body) {
        var self = this;
        self.constructor = Modal;
        self.id = id;
        self.label = label;
        self.title = title;
        self.body = body;
    };
    Modal.prototype = {
        create: function () {
            var self = this, $doc = $(document.body), _sb = new StringBuffer();
            _sb.append('<div id="').append(self.id).append('" class="modal fade" ').append('tabindex="-1" role="dialog" ')
                .append('aria-labelledby="').append(self.label).append('" aria-hidden="true">')
                .append('<div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header">')
                .append('<h5 class="modal-title" id="').append(self.label).append('">').append(self.title).append('</h5>')
                .append('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>')
                .append('<div class="modal-body">').append(self.body).append('</div>')
                .append('<div class="modal-footer">')
                .append('<button type="button" class="bs-close btn btn-secondary" data-dismiss="modal"><i class="fa fa-times"></i>&nbsp;关闭</button>')
                .append('<button type="button" class="bs-sure btn btn-primary"><i class="fa fa-trash"></i>&nbsp;确定</button>')
                .append('</div></div></div></div>');
            $doc.append(_sb.toString());
        },
        get: function () {
            var self = this, _sb = new StringBuffer();
            _sb.append('#').append(self.id);
            return $(_sb.toString());
        },
        toggle: function () {
            var self = this, $modal = self.get();
            if (!$modal.hasClass('show')) {
                $modal.modal();
            } else {
                $modal.modal('hide');
            }
        },
        show: function () {
            var self = this;
            self.toggle();
        },
        hide: function () {
            var self = this;
            self.toggle();
        }
    };

    /**
     * Operation: 表格操作按钮
     * @param tag
     * @param iconClass
     * @param caption
     * @param url
     * @constructor
     */
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
     * Table: 负责表格内容的生成
     * @param element   表格元素
     * @param config    包含 options 和 data
     */
    var Table = function (element, config) {
        var self = this;
        self.$element = $(element);
        self.constructor = Table;
        self.config = config;
        self.fields = [];                          // Map, key-value: fieldName-field
        self._attrs = [];                          // fieldNames, 用于 data 解析
        config.fields.forEach(function (currentValue, index, array) {
            var _field = currentValue;
            self._attrs.push(_field.name);
            self.fields[_field.name] = _field;
        });
        self.data = config.data;                   // 数组，每一个元素代表每一行的数据
    };
    Table.prototype = {
        getOpField: function () {
            var self = this,
                _default = new Field('ops', '操作', false);
            if (self.config.showOpField) {
                return _default;
            }

            return '';
        },
        defaultOps: function () {
            var _defaults = new Array();
            _defaults['edit'] = new Operation('a', 'bs-icon bs-edit fa fa-pencil', '编辑');
            _defaults['remove'] = new Operation('a', 'bs-icon bs-remove fa fa-trash', '删除');
            _defaults['update'] = new Operation('a', 'bs-icon bs-update fa fa-check', '保存');
            _defaults['cancel'] = new Operation('a', 'bs-icon bs-cancel fa fa-times', '取消');

            return _defaults;
        },
        _initCaption: function () {
            var self = this, _caption = self.config.caption;
            if (!_caption) {
                return '';
            }

            var _sb = new StringBuffer();
            _sb.append('<div class="bs-table-caption card-header">').append(_caption);
            if (self.config.fadeToggle) {
                _sb.append('<i class="bs-icon bs-fade-toggle fa fa-angle-double-down pull-right" aria-hidden="true"></i>');
            }
            _sb.append('</div>');

            return _sb.toString();
        },
        _initHeader: function () {
            var self = this, _sb = new StringBuffer();
            _sb.append('<thead  class="thead-dark"><tr>');
            for (var k in self.fields) {
                var _field = self.fields[k];
                _sb.append('<th ').append(Tool.setWidth(_field.width))
                    .append(' data-field="').append(_field.name).append('">')
                    .append(_field.caption).append('</th>');
            }

            // 操作
            if (self.config.showOpField) {
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
                    var attr = currentValue, _field = self.fields[attr];
                    _sb.append('<td data-field="').append(attr).append('">');
                    switch (_field.type) {
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

                if (self.config.showOpField) {
                    var defaultOps = self.defaultOps();
                    var opEdit = defaultOps['edit'], opDelete = defaultOps['remove'];
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
            if (self.config.showPagination) {
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
            if (self.config.tooltip) {
                $("[data-toggle=tooltip]").tooltip();
            }
        },
        listen: function () {
            var self = this, $el = self.$element, $card = $el.parent();
            $el.on('click', '.bs-edit', $.proxy(self, 'editRecord'));
            $el.on('click', '.bs-update', $.proxy(self, 'updateRecord'));
            $el.on('click', '.bs-cancel', $.proxy(self, 'cancelEdit'));
            $el.on('click', '.bs-remove', $.proxy(self, 'removeRecord'));

            if (self.config.fadeToggle) {
                $card.on('click', '.bs-table-caption', $.proxy(self, 'fadeToggle'));
            }
        },
        init: function () {
            var self = this, $el = self.$element, _sb = new StringBuffer();
            $el.wrap('<div class="card"></div>').before(self._initCaption());
            $el.addClass("bs-table table table-hover");
            _sb.append(self._initHeader()).append(self._initBody()).append(self._initFooter());
            $el.append(_sb.toString());

            self.listen();
            self.extra();
        },
        editRecord: function (event) {
            var self = this, $btn = $(event.toElement), $record = $btn.parents('tr'), _sb = new StringBuffer();
            self._dataBeforeEdit = [];

            $record.find('td').each(function (index, element) {
                var $td = $(element), fieldName = $td.data('field');
                if (typeof fieldName == 'undefined') {  // 操作
                    return true;           // each() 中 return true 相当于 continue, return false 相当于 break
                }

                var fieldValue = $td.text();
                self._dataBeforeEdit[fieldName] = fieldValue;
                var field = self.fields[fieldName];
                if (field.editable) {
                    _sb.append('<input class="bs" type="text" data-type="').append(field.type)
                        .append('" value="').append(fieldValue).append('"/>');
                } else {
                    _sb.append(fieldValue);
                }
                $td.html(_sb.toString());
                _sb.clear();
            });

            var $edit = $btn, $remove = $record.find('.bs-remove'), defaultOps = self.defaultOps();
            $edit.removeClass(defaultOps['edit'].iconClass).addClass(defaultOps['update'].iconClass);
            $edit.attr({'title': defaultOps['update'].caption, 'data-original-title': defaultOps['update'].caption});
            $remove.removeClass(defaultOps['remove'].iconClass).addClass(defaultOps['cancel'].iconClass);
            $remove.attr({'title': defaultOps['cancel'].caption, 'data-original-title': defaultOps['cancel'].caption});
        },
        updateRecord: function (event) {
            var self = this, $btn = $(event.toElement), $record = $btn.parents('tr'), _sb = new StringBuffer();
            $record.find('td').each(function () {
                var $td = $(this), $text = $td.find('input[type=text]');
                if (Tool.isExist($text)) {
                    var val = $text.val();
                    switch ($text.data('type')) {
                        case 'link':
                            _sb.append('<a class="bs-link" href="').append(val).append('">').append(val).append('</a>');
                            break;
                        default:
                            _sb.append(val);
                    }
                    $td.html(_sb.toString());
                    _sb.clear();
                }
            });

            var $update = $btn, $cancel = $record.find('.bs-cancel'), defaultOps = self.defaultOps();
            $update.removeClass(defaultOps['update'].iconClass).addClass(defaultOps['edit'].iconClass);
            $update.attr({'title': defaultOps['edit'].caption, 'data-original-title': defaultOps['edit'].caption});
            $cancel.removeClass(defaultOps['cancel'].iconClass).addClass(defaultOps['remove'].iconClass);
            $cancel.attr({'title': defaultOps['remove'].caption, 'data-original-title': defaultOps['remove'].caption});
        },
        cancelEdit: function (event) {
            var self = this, $btn = $(event.toElement), $record = $btn.parents('tr'), _sb = new StringBuffer();
            $record.find('td').each(function (index, element) {
                var $td = $(element),
                    $text = $td.find('input[type=text]');
                if ($text.length) {
                    var val = $text.val();
                    switch ($text.data('type')) {
                        case 'link':
                            _sb.append('<a class="bs-link" href="').append(val).append('">').append(val).append('</a>');
                            break;
                        default:
                            _sb.append(self._dataBeforeEdit[$td.data('field')]);
                    }
                    $td.html(_sb.toString());
                    _sb.clear();
                }
            });
            var $cancel = $btn, $update = $record.find('.bs-update'), defaultOps = self.defaultOps();
            $cancel.removeClass(defaultOps['cancel'].iconClass).addClass(defaultOps['remove'].iconClass);
            $cancel.attr({'title': defaultOps['remove'].caption, 'data-original-title': defaultOps['remove'].caption});
            $update.removeClass(defaultOps['update'].iconClass).addClass(defaultOps['edit'].iconClass);
            $update.attr({'title': defaultOps['edit'].caption, 'data-original-title': defaultOps['edit'].caption});
        },
        removeRecord: function (event) {
            var self = this, $btn = $(event.toElement), $record = $btn.parents('tr'), _sb = new StringBuffer();
            $record.attr("data-remove", true);
            var mDelete = new Modal('mDelete', 'mDeleteLabel', '警告', '一旦删除不可恢复，确定删除吗？');
            mDelete.create();
            mDelete.toggle();
            var $modal = mDelete.get();
            var _extra = self.config.removeExtra.field;
            $modal.find('.bs-sure').attr("data-extra", _extra);
            var _fn = function () {
                mDelete.toggle();
                $record.remove();
            };
            $modal.on('click', '.bs-sure', function () {
                if (self.config.removeUrl) {
                    var _sb = new StringBuffer();
                    _sb.append('{"').append(_extra).append('":')
                        .append($record.find('[data-field=' + _extra + ']').text())
                        .append('}');

                    var ajax = Tool.getAjaxConf(self.config.removeUrl, JSON.parse(_sb.toString()), _fn);
                    $.ajax(ajax);
                    return;
                }

                _fn();
            });
        },
        fadeToggle: function (event) {
            var self = this, $el = self.$element, $caption = $(event.toElement),
                $iconFadeToggle = $caption.find('.bs-fade-toggle');
            if ($iconFadeToggle.hasClass("fa-angle-double-left")) {
                Tool.classToggle($iconFadeToggle, 'fa-angle-double-left', 'fa-angle-double-down');
                Tool.tableSlideToggle($el);
            } else if ($iconFadeToggle.hasClass("fa-angle-double-down")) {
                Tool.classToggle($iconFadeToggle, 'fa-angle-double-down', 'fa-angle-double-left');
                Tool.tableSlideToggle($el);
            }
        }
    };

    $.fn.table = function (option, data) {
        var $tb = this;
        // ----------------------------------
        // 参数检查
        // ----------------------------------
        var config = $.extend(true, {}, $.fn.table.defaults, option, {data: data});
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
        config.fields = fields;
        var table = new Table($tb, config);
        table.init();
    };

    $.fn.table.defaults = {
        caption: '',                    // 可选，表格说明
        columns: [],                    // 每一列的结构体, 必填
        showOpField: true,              // 是否显示操作栏
        showPagination: false,          // 是否显示分页组件
        tooltip: true,                  // 启用 bootstrap tooltip
        fadeToggle: false,               // 是否可以折叠
        addUrl: '',
        editUrl: '',
        updateUrl: '',
        removeUrl: ''
    };
})(jQuery);