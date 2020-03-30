<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use GuzzleHttp\Psr7\Request as GRequest;
use GuzzleHttp\Psr7\Response as GResponse;
use GuzzleHttp\Stream\Stream as GStream;
use Slim\Exception\HttpNotFoundException;

require __DIR__ . '/../vendor/autoload.php';

function main(){

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

      // $app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function ($request, $response) {
      //   throw new HttpNotFoundException($request);
      // });

      $client_info = array('client_id'=> '91dc76170db3fdfec8cad0bfdee857f3',
            'client_secret' => 'fc03abf96b50570a53b2c30d82695fa4',
            'api_endpoint'=> 'https://api.codechef.com',
            'authorization_code_endpoint'=> 'https://api.codechef.com/oauth/authorize',
            'access_token_endpoint'=> 'https://api.codechef.com/oauth/token',
            'redirect_uri'=> 'http://localhost:3000/',
            'website_base_url' => 'http://localhost:7000/',
            'state'=>'xyz'
            );
      $login_status = 0;
      $oauth_details = array('authorization_code' => '',
                'access_token' => '',
                'refresh_token' => '');

      $guzzle = new \GuzzleHttp\Client([
        'base_uri' => $client_info['api_endpoint'],
      ]);

      //backend start
      $app->get('/', function (Request $request, Response $response, $args) use ($oauth_details) {
          $response->getBody()->write(json_encode(['author' => 'sayantanu']));
          return $response->withHeader('Content-Type', 'application/json');
      });

      //login
      $app->post('/login', function (Request $request, Response $response, $args) use($client_info,$oauth_details,$guzzle,$login_status){
          $code = json_decode($request->getBody(),true)['code'];
          //$code = $request->getParseBody()['code'];
          if($code!='')
              {$oauth_details['authorization_code'] = $code;
                $params = array('grant_type'=>'authorization_code',
                                'code'=>$oauth_details['authorization_code'],
                                'client_id'=>$client_info['client_id'],
                                'client_secret'=>$client_info['client_secret'],
                                'redirect_uri'=>$client_info['redirect_uri']
                               );
                  try{
                        $Rresponse = $guzzle->request('POST','/oauth/token',['form_params'=>$params]);
                        if($Rresponse->getStatusCode()!=200)
                            {throw new Exception("failed");}

                        $body = $Rresponse->getBody();
                        $res = json_decode($body,true);
                        $result = $res['result']['data'];
                        $oauth_details['access_token'] = $result['access_token'];
                        $oauth_details['refresh_token'] = $result['refresh_token'];
                        $oauth_details['scope'] = $result['scope'];
                        $login_status = 1;
                        $response->getBody()->write(json_encode($oauth_details));
                  }catch(Exception $e){
                        $login_status = 0;
                      }

                        if($login_status==0)
                        { $errorar = array("error" => "invalid_authorization_code");
                          $response->getBody()->write(json_encode($errorar));
                        }
              }
              else {
                $response->getBody()->write(json_encode(array("error" => "no_authorization_code")));
              }
          return $response->withHeader('Content-Type', 'application/json');
      });

      //logout
      $app->post('/logout', function (Request $request, Response $response, $args) use($oauth_details,$login_status){
          $oauth_details['authorization_code'] = '';
          $oauth_details['access_token'] = '';
          $oauth_details['refresh_token'] = '';
          $login_status = 0;
          return $response->withHeader('Content-Type', 'application/json');
      });

      $app->run();

}

main();
