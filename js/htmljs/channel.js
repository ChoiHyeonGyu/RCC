$(function(){
    var lastnum = 0;
    if($('#channel_sub_btn').hasClass('btn-success')){
        var chksub = 0;
    } else {
        var chksub = 1;
    }

    function pageSelecting(){
        if($(location).attr('search').match('s=1')){
            return 1;
        }
    }

    function sortSelecting(){
        if($(location).attr('search').match('sort=1')){
            return 1;
        } else if($(location).attr('search').match('sort=2')) {
            return 2;
        } else if($(location).attr('search').match('sort=3')) {
            return 3;
        }
    }

    $(document).on('click', '.pb', function(){
        var s = pageSelecting();
        var sort = sortSelecting();

        $.ajax({
            url: '/channel/pagelist',
            data: {
                chnlid: $('input[type=hidden]').val(),
                s: s,
                sort: sort,
                id: $(this).attr('nextid')
            },
            success: function(result){
                rowsProcessing(result.data);
            },
            error: function(error){
                console.log(error);
            }
        });
        $('.pb').removeClass('active');
        $(this).addClass('active');
    });

    $(document).on('click', '.nb', function(){
        var s = pageSelecting();
        var sort = sortSelecting();

        $.ajax({
            url: '/channel/pagelist',
            data: {
                chnlid: $('input[type=hidden]').val(),
                s: s,
                sort: sort,
                id: $(this).attr('nextid')
            },
            success: function(result){
                rowsProcessing(result.data);
                lastnum += 10;
                pageProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    $(document).on('click', '.preb', function(){
        var s = pageSelecting();
        var sort = sortSelecting();

        $.ajax({
            url: '/channel/pagelist',
            data: {
                chnlid: $('input[type=hidden]').val(),
                s: s,
                sort: sort,
                id: $(this).attr('nextid')
            },
            success: function(result){
                rowsProcessing(result.data);
                lastnum -= 10;
                pageProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    function rowsProcessing(data){
        var rows = data.rows;
        $('#boardlist tr').remove();
        for(var i = 0; i < rows.length; i++){
            if(data.metaData[1].name == "HEADLINE"){
                $('#boardlist').append("<tr class='selrow'> <th scope='row'>"+rows[i][0]+"</th> <td class='headline'>"+rows[i][1]+"</td> <td>"+rows[i][2]+
                "</td> <td>"+rows[i][3]+"</td> <td>"+rows[i][4]+"</td> <td>"+rows[i][5]+"</td> <td>"+rows[i][6]+"</td> </tr>");
            } else {
                $('#boardlist').append("<tr class='selrow'> <th scope='row'>"+rows[i][0]+"</th> <td class='title'>"+rows[i][1]+"</td> <td>"+rows[i][2]+"</td> <td>"+
                rows[i][3]+"</td> <td>"+rows[i][4]+"</td> <td>"+rows[i][5]+"</td> <td>"+rows[i][6]+"</td> </tr>");
            }
        }
    }

    function pageProcessing(result){
        var page = result.page.rows;
        $('#pagelist button').remove();
        for(var i = 0; i < page.length; i++){
            if(i == 0){
                if(result.previd){
                    $('#pagelist').append("<button type='button' class='btn btn-light preb' nextid='"+result.previd+"'>&lt;</button>");
                }
                $('#pagelist').append("<button type='button' class='btn btn-light active pb' nextid='"+page[i]+"'>"+(lastnum + 1)+"</button>");
            } else if(i == 10) {
                $('#pagelist').append("<button type='button' class='btn btn-light nb' nextid='"+page[i]+"'>&gt;</button>");
            } else {
                $('#pagelist').append("<button type='button' class='btn btn-light pb' nextid='"+page[i]+"'>"+(lastnum + i + 1)+"</button>");
            }
        }
    }

    $(document).on('click', '.headline', function(){
        location.href = "/breifing_view?postNo=" + $(this).prev().text();
    });

    $(document).on('click', '.title', function(){
        location.href = "/commentary_view?postNo=" + $(this).prev().text();
    });

    $(document).on('mouseover', '.selrow', function(){
        $(this).addClass('table-info');
    });

    $(document).on('mouseout', '.selrow', function(){
        $(this).removeClass('table-info');
    });

    $(document).on('click', '#channel_sub_btn', function(){
        if(chksub){
            $.ajax({
                url: '/subscribe',
                data: {
                    chnlid: $('input[type=hidden]').val()
                },
                success: function(result){
                    if(parseInt(result)){
                        $('#channel_sub_btn').removeClass('btn-light');
                        $('#channel_sub_btn').addClass('btn-success');
                    }
                    chksub = 0;
                },
                error: function(error){
                    console.log(error);
                }
            });
        } else {
            $.ajax({
                url: '/subscribe/cancel',
                data: {
                    chnlid: $('input[type=hidden]').val()
                },
                success: function(result){
                    if(parseInt(result)){
                        $('#channel_sub_btn').removeClass('btn-success');
                        $('#channel_sub_btn').addClass('btn-light');
                    }
                    chksub = 1;
                },
                error: function(error){
                    console.log(error);
                }
            });
        }
    });

    $(document).on('keydown', '#search_input', function(){
        if(event.keyCode == 13){
            $.ajax({
                url: '/channel/search',
                data: {
                    chnlid: $('input[type=hidden]').val(),
                    txt: $(this).val()
                },
                success: function(result){
                    rowsProcessing(result.data);
                    lastnum = 0;
                    searchPaging(result);
                },
                error: function(error){
                    console.log(error);
                }
            });
        }
    });

    $(document).on('click', '.srchb', function(){
        $.ajax({
            url: '/channel/search/pagelist',
            data: {
                chnlid: $('input[type=hidden]').val(),
                txt: $('#search_input').val(),
                id: $(this).attr('nextid')
            },
            success: function(result){
                rowsProcessing(result.data);
            },
            error: function(error){
                console.log(error);
            }
        });
        $('.srchb').removeClass('active');
        $(this).addClass('active');
    });

    $(document).on('click', '.nsrchb', function(){
        $.ajax({
            url: '/channel/search/pagelist',
            data: {
                chnlid: $('input[type=hidden]').val(),
                txt: $('#search_input').val(),
                id: $(this).attr('nextid')
            },
            success: function(result){
                rowsProcessing(result.data);
                lastnum += 10;
                searchPaging(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    $(document).on('click', '.presrchb', function(){
        $.ajax({
            url: '/channel/search/pagelist',
            data: {
                chnlid: $('input[type=hidden]').val(),
                txt: $('#search_input').val(),
                id: $(this).attr('nextid')
            },
            success: function(result){
                rowsProcessing(result.data);
                lastnum -= 10;
                searchPaging(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    function searchPaging(result){
        var page = result.page.rows;
        $('#pagelist button').remove();
        for(var i = 0; i < page.length; i++){
            if(i == 0){
                if(result.previd){
                    $('#pagelist').append("<button type='button' class='btn btn-light presrchb' nextid='"+result.previd+"'>&lt;</button>");
                }
                $('#pagelist').append("<button type='button' class='btn btn-light active srchb' nextid='"+page[i]+"'>"+(lastnum + 1)+"</button>");
            } else if(i == 10) {
                $('#pagelist').append("<button type='button' class='btn btn-light nsrchb' nextid='"+page[i]+"'>&gt;</button>");
            } else {
                $('#pagelist').append("<button type='button' class='btn btn-light srchb' nextid='"+page[i]+"'>"+(lastnum + i + 1)+"</button>");
            }
        }
    }

    $(document).on('change', '.sort', function(){
        if($(location).attr('search').match('s=1')){
            if($(location).attr('search').match('&sort=')){
                var channel = $(location).attr('search').substr(0, $(location).attr('search').match('s=1').index + 3) + "&sort=";
            } else {
                var channel = $(location).attr('search').match('s=1').input + "&sort=";
            }
        } else {
            if($(location).attr('search').match('&sort=')){
                var channel = $(location).attr('search').substr(0, $(location).attr('search').match('&').index) + "&sort=";
            } else {
                var channel = $(location).attr('search').substr(0, 28) + "&sort=";
            }
        }

        if($(this).val() == "최신 순"){
            location.href = channel + "0";
        } else if($(this).val() == "오래된 순") {
            location.href = channel + "1";
        } else if($(this).val() == "조회 수") {
            location.href = channel + "2";
        } else if($(this).val() == "후원 총액") {
            location.href = channel + "3";
        }
    });
});