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
                                 'redirect_uri'=> 'http://localhost:7000/login',
                                 'website_base_url' => 'http://localhost:7000/',
                                 'state'=>'xyz');

require __DIR__ . '/../vendor/autoload.php';
require __DIR__.'/../src/config/database.php';

$app = AppFactory::create();

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
    if($_COOKIE['user']!=''){
      $user = array("user"=>$_COOKIE['user']);
      $response->getBody()->write(json_encode($user));
    }
    else {
      $user = array("user"=>"");
      $response->getBody()->write(json_encode($user));
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
