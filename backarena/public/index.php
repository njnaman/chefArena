<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

session_start();

$_SESSION['client_info'] = array('client_id'=> '91dc76170db3fdfec8cad0bfdee857f3',
                                 'client_secret' => 'fc03abf96b50570a53b2c30d82695fa4',
                                 'api_endpoint'=> 'https://api.codechef.com',
                                 'authorization_code_endpoint'=> 'https://api.codechef.com/oauth/authorize',
                                 'access_token_endpoint'=> 'https://api.codechef.com/oauth/token',
                                 'redirect_uri'=> 'https://codechefarena.herokuapp.com/',
                                 'website_base_url' => 'https://codechefarena.herokuapp.com/',
                                 'state'=>'xyz');

require __DIR__ . '/../vendor/autoload.php';
require __DIR__.'/../src/config/database.php';

$app = AppFactory::create();


$app->setBasePath((function () {
    $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
    $uri = (string) parse_url('http://a' . $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if (stripos($uri, $_SERVER['SCRIPT_NAME']) === 0) {
        return $_SERVER['SCRIPT_NAME'];
    }
    if ($scriptDir !== '/' && stripos($uri, $scriptDir) === 0) {
        return $scriptDir;
    }
    return '';
})());


$app->options('/{routes:.+}', function ($request, $response, $args) {
  return $response;
});

$app->add(function ($request, $handler) {
  $response = $handler->handle($request);
  return $response
  ->withHeader('Access-Control-Allow-Origin', '*')
  ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
  ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

$_SESSION['guzzle'] = new \GuzzleHttp\Client([
  'base_uri' => $_SESSION['client_info']['api_endpoint'],
]);


$app->get('/', function (Request $request, Response $response, $args) {
        $cookie = $_GET['user'];
        if($cookie!=''){

      $sql = "Select * from users where username ='".$cookie."';";
      try{
                $db = new database();
                $db = $db->connect();
                $statement = $db->query($sql);
                $user = $statement->fetchAll(PDO::FETCH_OBJ);
                $user = json_decode(json_encode($user[0]),true);
                $access_token = $user["accesstoken"];

      if($user["active"]=="F"){
            $refresh_token = $user["refreshtoken"];

            //refreshtokenfirst
            $params = array(
                      'grant_type'=>'refresh_token',
                      'refresh_token'=>$refresh_token,
                      'client_id'=>$_SESSION['client_info']['client_id'],
                      'client_secret'=>$_SESSION['client_info']['client_secret']
                     );
           $Rresponse = $_SESSION['guzzle']->request('POST','/oauth/token',['form_params'=>$params]);
           if($Rresponse->getStatusCode()!=200)
               {throw new Exception("failed");}

           $body = $Rresponse->getBody();
           $res = json_decode($body,true);
           $result = $res['result']['data'];
           $access_token = $result['access_token'];
           $refresh_token = $result['refresh_token'];
           $sql_str = "Update users set accesstoken = '".$access_token."',refreshtoken = '".$refresh_token."',logintime = NOW(),active = 'T' where username = '".$_GET['user']."';";
           $db->query($sql_str);
      }
                $res = array("status"=>"OK","data"=>["username"=>$user["username"],"access_token"=>$access_token,"band"=>$user["band"]]);
                $response->getBody()->write(json_encode($res));

        }catch(Exception $e){
               $response->getBody()->write(json_encode(
                         array("status"=>"error","data"=>["message"=>"database error"])
                       ));
       }
      //$response->getBody()->write(json_encode($res));
    }
    else {
      $response->getBody()->write(json_encode(
                         array("status"=>"OK","data"=>["username"=>"_"])
                       ));
    }
    return $response->withHeader('Content-Type', 'application/json');
});


require __DIR__.'/../src/routes/auth.php';
require __DIR__.'/../src/routes/contest_list.php';
require __DIR__.'/../src/routes/contest.php';
require __DIR__.'/../src/routes/question.php';
require __DIR__.'/../src/routes/ranklist.php';
require __DIR__.'/../src/routes/submit.php';
require __DIR__.'/../src/routes/submissions.php';

$app->run();

                          
