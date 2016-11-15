var logout = $S('.logout')[0];

logout.onclick = function(){
	window.localStorage.removeItem('user');
	window.location.href = '/';
}
