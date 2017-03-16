file chứa các code về client Angular

|app_client --> chứa các file liên quan về code Angular
|	|common
|		|directive --> chứa các file liên quan về directive
|			|footerGeneric --> khi tạo mới directive, thì phải có 1 folder để chứa file template html cho nó. Tên file phải theo công thức sau: [tên directive].template.html
|				|footerGeneric.template.html 
|			|navifation
|				|navigation_template_html
|			|footerGeneric.directive.js --> code của directive. Tên file phải theo công thức sau: [tên directive].directive.js
|			|navigation.đirective.js
|		|filters --> chứa các file code liên quan về filter Tên file phải theo công thức sau: [tên filter].filter.js
|			|addHtmlLineBreak.filter.js
|		|services --> chứa các file code liên quan về services Tên file phải theo công thức sau: [tên service].service.js
|			|geolocation.service.js
|		|views --> chứa các file html của các controllers mà có ý định dùng chung html
|			|general.view.html
|	|home --> chứa các file code của các controller + html cho 1 trang.. Tên file phải theo công thức sau: [tên controller].controller.js  , đối với view thì là [tên controller].view.html
|			|home.controller.js
|			| home.view.html
|	|lib --> chứa các thư viện liên quan đến Angular
|		|angular-route.min.js 
|	|app.js -->  file main của Angular
|	|index.html --> file template của các trang Angular
