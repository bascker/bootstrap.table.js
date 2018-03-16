/**
 * Created by bascker on 2018/3/5.
 * 自定义 table 插件
 * 依赖库:
 *  1) bootstrap4.x
 */
(function ($) {
    $.fn.table = function (config) {
        var defaults = {
            caption: '用户信息',               // 可选
            columns: [],                      // 每一列的结构体, 必填
            ops: [],
            opsField: 'ops',
            opsCaption: '操作',
            data: [],
            fadeToggle: true,               // 是否可以折叠
            tooltip: true,                  // 启用 bootstrap tooltip
            pagination: true                // 是否分页
        };

        // ----------------------------------
        // 参数检查
        // ----------------------------------
        var config = $.extend(true, defaults, config);
        function check() {
            if (!config.columns) {
                throw new Error('params error!');
            }
        }
        check();

        // ----------------------------------
        // 初始化表格内容
        // ----------------------------------
        function getCaption() {
            if (config.caption) {
                var caption = '<div class="card-header">' + config.caption + '</div>';
                return caption;
            }
        }

        var attributes = [];
        function getTableHead() {
            var thead = '<thead  class="thead-dark"><tr>';
            config.columns.forEach(function (currentValue, index, array) {
                var obj = currentValue;
                attributes.push(obj.field);
                thead += ('<th data-field="' + obj.field + '">' + obj.caption + '</th>');
            });
            if (config.ops) {
                thead += ('<th data-field="' + config.opsField + '">' + config.opsCaption + '</th>');
            }

            return thead;
        }

        function _initOps() {
            var map = [];
            if(config.ops) {
                config.ops.forEach(function (currentValue, index, array) {
                    map[currentValue.name] = currentValue;
                });
            }

            return map;
        }
        var ops = _initOps();
        
        function _initColumns() {
            var map = [];
            config.columns.forEach(function (currentValue, index, array) {
                map[currentValue.field] = currentValue;
            });

            return map;
        }
        var cols = _initColumns();

        function getOps () {
            var ops = config.ops;
            if (config.ops) {
                var html = '<td data-field="' + config.opsField + '">';
                ops.forEach(function (currentValue, index, array) {
                    var btn = currentValue;
                    html += ('<' + btn.tag + ' class="bs-icon ' + btn.iconClass + '" name="' + btn.name + '" title="' + btn.title + '" data-toggle="tooltip" data-placement="top">' + (!btn.text ? '': btn.text) + '</' + btn.tag + '>');
                });
                html += '</td>';
                return html;
            }
        }

        function getTableBody () {
            var tbody = '<tbody><tr>';
            config.data.forEach(function (currentValue, index, array){
                var obj = currentValue;
                var tr = '<tr>';
                attributes.forEach(function (currentValue, index, array) {
                    var col = cols[currentValue],
                        h = '';
                    switch (col.type) {
                        case 'link':
                            h = '<a class="bs-link" href="' + obj[currentValue] + '">' + obj[currentValue] + '</a>';
                            break;
                        case 'img':

                            break;
                        case 'select':

                            break;
                        case 'switch':

                            break;
                        case 'password':
                            h = obj[currentValue] + '<i class="bs-icon fa fa-eye pull-right" aria-hidden="true"></i>';
                            break;
                        case 'text':
                        case 'textarea':
                        case 'number':
                        case 'time':
                        default:
                            h = obj[currentValue];
                    }

                    tr += ('<td data-field="' + currentValue + '">' + h + '</td>');
                });

                if (config.ops) {
                    tr += getOps();
                }
                tr += '</tr>';
                tbody += tr;
            });
            tbody += '</tr></tbody>';

            return tbody;
        }

        function getTableFoot() {
            if (config.pagination) {
                var colspan = attributes.length;
                if (config.ops) {
                    colspan += 1;
                }

                var tfoot = '<tfoot>'
                    + '<tr>'
                    + '<td colspan="' + colspan + '" class="text-center">'
                    + '<nav aria-label="Page navigation">'
                    + '<ul class="pagination justify-content-center" style="margin: 0">'
                    + '<li class="page-item disabled"><a class="page-link" href="#">首页</a></li>'
                    + '<li class="page-item"><a class="page-link" href="#" aria-label="Previous" data-toggle="tooltip" data-placement="top" title="上一页" aria-hidden="true"><span>&laquo;</span><span class="sr-only">Previous</span></a></li>'
                    + '<li class="page-item"><a class="page-link active" href="#">1<span class="sr-only">(current)</span></a></li>'
                    + '<li class="page-item"><a class="page-link" href="#">2</a></li>'
                    + '<li class="page-item"><a class="page-link" href="#" aria-label="Next" data-toggle="tooltip" data-placement="top" title="下一页"><span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span></a></li>'
                    + '<li class="page-item"><a class="page-link" href="#">尾页</a></li>'
                    + '</ul>'
                    + '</nav>'
                    + '</td>'
                    + '</tr>'
                    + '</tfoot>';

                return tfoot;
            }
        }

        // this 代表调用 table() 方法的对象
        var $table = this;
        var card = '<div class="card">'
            + getCaption()
            + '<table class="bs-table table table-hover">'
            + getTableHead()
            + getTableBody()
            + getTableFoot()
            + '</table>'
            + '</div>';
        $table.append(card);

        function getAjaxConf (url, data, success) {
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

        // 编辑
        var dataBeforeEdit = [];
        $table.on('click', '.fa-pencil', function () {
            var $obj = $(this),
                $tr = $obj.parents("tr");

            $tr.find('td').each(function (index, element) {
                var $td = $(element),
                    h = '';
                if ($td.data('field') == config.opsField) {
                    return true;           // each() 中 return true 相当于 continue, return false 相当于 break
                }

                // 存储原始数据
                dataBeforeEdit[$td.data('field')] = $td.text();

                // 效果
                var field = cols[$td.data('field')];
                if (field.editable) {
                    h = ('<input class="bs" type="text" data-type="' + field.type + '" value="' + $td.text() + '"/>');
                } else {
                    h = $td.text();
                }
                $td.html(h);
            });

            var $edit = $tr.find('.fa-pencil'),
                $delete = $tr.find('.fa-trash');
            $edit.removeClass('fa-pencil').addClass('fa-check');
            $edit.attr({'name': 'save', 'title': '保存'});
            $delete.removeClass('fa-trash').addClass('fa-times');
            $delete.attr({'name': 'cancel', 'title': '取消'});
            $("[data-toggle=tooltip]").tooltip();
        });

        // 保存
        $table.on('click', '.fa-check', function () {
            var $obj = $(this),
                $tr = $obj.parents('tr');

            $tr.find('td').each(function () {
                var $td = $(this),
                    $text = $td.find('input[type=text]');

                if ($text.length) {
                    switch ($text.data('type')) {
                        case 'link':
                            $td.html('<a class="bs-link" href="' + $text.val() + '">' + $text.val() + '</a>');
                            break;
                        default:
                            $td.html($text.val());
                    }
                }
            });

            var $save = $tr.find('.fa-check'),
                $cancel = $tr.find('.fa-times');
            $save.removeClass('fa-check').addClass('fa-pencil');
            $save.attr({'name': 'edit', 'title': '编辑'});
            $cancel.removeClass('fa-times').addClass('fa-trash');
            $cancel.attr({'name': 'delete', 'title': '删除'});
        });

        // 取消
        $table.on('click', '.fa-times', function () {
            var $btn = $(this),
                $tr = $btn.parents('tr');

            $tr.find('td').each(function (index, element) {
                var $td = $(element),
                    $text = $td.find('input[type=text]');
                if ($text.length) {
                    switch ($text.data('type')) {
                        case 'link':
                            $td.html('<a class="bs-link" href="' + $text.val() + '">' + $text.val() + '</a>');
                            break;
                        default:
                            $td.html(dataBeforeEdit[$td.data('field')]);
                    }
                }
            });
            var $save = $tr.find('.fa-check'),
                $cancel = $tr.find('.fa-times');
            $save.removeClass('fa-check').addClass('fa-pencil');
            $save.attr({'name': 'edit', 'title': '编辑'});
            $cancel.removeClass('fa-times').addClass('fa-trash');
            $cancel.attr({'name': 'delete', 'title': '删除'});
            dataBeforeEdit = [];
        });

        // 删除
        $table.on('click', '.fa-trash', function () {
            var $obj = $(this),
                $tr = $obj.parents("tr");
            $tr.attr("data-remove", true);
            $($modals.delete.id).find('.bs-sure').attr("data-key", $tr.find('[data-field=' + ops[$obj.attr("name")].key + ']').text());
            $($modals.delete.id).modal();
        });

        // ----------------------------------
        // 模态框
        // ----------------------------------
        var $modals = {
            delete: {
                id: '#modalDelete',
                label: '删除',
                html: '<div class="modal fade" id="modalDelete" tabindex="-1" role="dialog" aria-labelledby="deleteModalLabel" aria-hidden="true">'
                        + '<div class="modal-dialog" role="document">'
                        + '<div class="modal-content">'
                        + '<div class="modal-header">'
                        + '<h5 class="modal-title" id="deleteModalLabel">警告</h5>'
                        + '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
                        + '</div>'
                        + '<div class="modal-body">一旦删除不可恢复，确定删除吗？</div>'
                        + '<div class="modal-footer">'
                        + '<button type="button" class="bs-close btn btn-secondary" data-dismiss="modal"><i class="fa fa-times"></i>&nbsp;关闭</button>'
                        + '<button type="button" class="bs-sure btn btn-primary"><i class="fa fa-trash"></i>&nbsp;确定</button>'
                        + '</div>'
                        + '</div></div></div>'
            }
        };
        $(document.body).append($modals.delete.html);

        $($modals.delete.id).on('click', '.bs-close', function () {
            $($modals.delete.id).modal('hide');
        });

        $($modals.delete.id).on('click', '.bs-sure', function () {
            var conf = getAjaxConf(ops['delete'].url, {id: $($modals.delete.id).find('.bs-sure').data('key')}, function (data) {
                $($modals.delete.id).modal('hide');
                $table.find("tr[data-remove=true]").remove();
            });

            $.ajax(conf);
        });

        // --------------------------------------
        // 附加效果初始化
        // --------------------------------------
        $("[data-toggle=tooltip]").tooltip();
    }
})(jQuery);