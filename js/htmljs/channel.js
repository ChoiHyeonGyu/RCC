$(function(){
    var lastnum = 0;

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
});