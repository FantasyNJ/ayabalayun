(function(){
    var nameElem = document.querySelector('.user-name');
    var nameDialog = document.querySelector('.user-name-dialog');

    ajax({
        method: 'get',
        url: '/api/data/getUserName',
        success: function(result){
            nameElem.innerHTML = nameDialog.innerHTML = result.username;
        }
    })
})();