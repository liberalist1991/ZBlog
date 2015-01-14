
$(function(){
	(function editPost(){
		//编辑文章按钮点击
		$('.editPostBtn').click(function(){

			var username = $(this).attr('data-username'),
			 day = $(this).attr('data-day'),
			 title = $(this).attr('data-title');
			$.ajax({
				url: 'editPost',
				type: 'get',
				data: {'username':username, 'day':day, 'title': title},
				success:  function(data){
					$("#editPostModel").data('post', data.posts[0]);
					$("#editPostModel").modal({show: true});
				}
			});
		});
		
		//编辑文章model注册事件
		$("#editPostModel").on('show', function(){
		
			var post = $(this).data('post');
			if(post){
				$(this).find("#title").val(post.title);
				$(this).find("#post").val(post.post);
				$(this).find("#tags").val(post.tags);
				$(this).find("#categories").val(post.categories);
			}
		}).on('hidden', function(){
			if($(this).data('post'))
				$(this).data('post', null);
			window.location.href="/";
		});
		//修改异步提交
		$("#editPostModel").submit(function(){
			var form = $(this), post = form.data('post');
			//var newPost = {'title': form.find('#title').val(), 'post': form.find('#post').val()};
			var data = {'username': post.username, 'day':post.time.day, 'oldTitle': post.title};
			$.extend(data, form.serializeJson());
			$.ajax({
				url: 'editPost',
				type: 'post',
				data: data,
				success: function(data){
				console.log(data);
					if(data.success){
						form.modal('hide');	
					}
				}
			});
			return false;
		});
	})();
	
	
	(function search(){
		$("#searchForm").submit(function(){
		
		});
	})();
	
});

//插件，表单序列化后对象化
(function($){  
        $.fn.serializeJson=function(){  
            var serializeObj={};  
            $(this.serializeArray()).each(function(){  
                serializeObj[this.name]=this.value;  
            });  
            return serializeObj;  
        };  
    })(jQuery);  