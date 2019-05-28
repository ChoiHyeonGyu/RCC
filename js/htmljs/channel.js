$(function(){
    var lastnum = 0;
    var chksub = 1;

    $(document).on('click', '.pb', function(){
        $.ajax({
            url: '/channel/post/pagelist',
            data: {
                id: $('input[type=hidden]').val(),
                pid: $(this).attr('nextpid')
            },
            success: function(result){
                rowsProcessing(result.rows);
            },
            error: function(error){
                console.log(error);
            }
        });
        $('.pb').removeClass('active');
        $(this).addClass('active');
    });

    $(document).on('click', '.nb', function(){
        $.ajax({
            url: '/channel/post/pagelist',
            data: {
                id: $('input[type=hidden]').val(),
                pid: $(this).attr('nextpid')
            },
            success: function(result){
                rowsProcessing(result.rows);
                lastnum += 10;
                pageProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    $(document).on('click', '.preb', function(){
        $.ajax({
            url: '/channel/post/pagelist',
            data: {
                id: $('input[type=hidden]').val(),
                pid: $(this).attr('nextpid')
            },
            success: function(result){
                rowsProcessing(result.rows);
                lastnum -= 10;
                pageProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    function rowsProcessing(rows){
        $('#boardlist tr').remove();
        for(var i = 0; i < rows.length; i++){
            if(rows[i][6] != null){
                $('#boardlist').append("<tr class='selrow'> <th scope='row'>"+rows[i][0]+"</th> <td class='title'>"+rows[i][6]+"</td> <td>"+rows[i][4]+
                "</td> <td>"+rows[i][5]+"</td> <td>"+rows[i][2]+"</td> <td>"+rows[i][1]+"</td> <td>"+rows[i][3]+"</td> </tr>");
            } else {
                $('#boardlist').append("<tr class='selrow'> <th scope='row'>"+rows[i][0]+"</th> <td class='headline'>"+rows[i][7]+"</td> <td>"+rows[i][4]+"</td> <td>"+
                rows[i][5]+"</td> <td>"+rows[i][2]+"</td> <td>"+rows[i][1]+"</td> <td>"+rows[i][3]+"</td> </tr>");
            }
        }
    }

    function pageProcessing(result){
        var page = result.page;
        $('#pagelist button').remove();
        for(var i = 0; i < page.length; i++){
            if(i == 0){
                if(result.prevpid){
                    $('#pagelist').append("<button type='button' class='btn btn-light preb' nextpid='"+result.prevpid+"'>&lt;</button>");
                }
                $('#pagelist').append("<button type='button' class='btn btn-light active pb' nextpid='"+page[i]+"'>"+(lastnum + 1)+"</button>");
            } else if(i == 10) {
                $('#pagelist').append("<button type='button' class='btn btn-light nb' nextpid='"+page[i]+"'>&gt;</button>");
            } else {
                $('#pagelist').append("<button type='button' class='btn btn-light pb' nextpid='"+page[i]+"'>"+(lastnum + i + 1)+"</button>");
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
                    channelID: $('input[type=hidden]').val()
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
                    channelID: $('input[type=hidden]').val()
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
                url: '/channel/post/search',
                data: {
                    channelID: $('input[type=hidden]').val(),
                    txt: $(this).val()
                },
                success: function(result){
                    rowsProcessing(result.rows);
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
                channelID: $('input[type=hidden]').val(),
                txt: $('#search_input').val(),
                pid: $(this).attr('nextpid')
            },
            success: function(result){
                rowsProcessing(result.rows);
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
                channelID: $('input[type=hidden]').val(),
                txt: $('#search_input').val(),
                pid: $(this).attr('nextpid')
            },
            success: function(result){
                rowsProcessing(result.rows);
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
                channelID: $('input[type=hidden]').val(),
                txt: $('#search_input').val(),
                pid: $(this).attr('nextpid')
            },
            success: function(result){
                rowsProcessing(result.rows);
                lastnum -= 10;
                searchPaging(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    function searchPaging(result){
        var page = result.page;
        $('#pagelist button').remove();
        for(var i = 0; i < page.length; i++){
            if(i == 0){
                if(result.prevpid){
                    $('#pagelist').append("<button type='button' class='btn btn-light presrchb' nextpid='"+result.prevpid+"'>&lt;</button>");
                }
                $('#pagelist').append("<button type='button' class='btn btn-light active srchb' nextpid='"+page[i]+"'>"+(lastnum + 1)+"</button>");
            } else if(i == 10) {
                $('#pagelist').append("<button type='button' class='btn btn-light nsrchb' nextpid='"+page[i]+"'>&gt;</button>");
            } else {
                $('#pagelist').append("<button type='button' class='btn btn-light srchb' nextpid='"+page[i]+"'>"+(lastnum + i + 1)+"</button>");
            }
        }
    }
});