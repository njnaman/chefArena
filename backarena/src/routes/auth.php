<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

//login route
$app->get('/login', function (Request $request, Response $response, $args) {

      if(isset($_GET['code'])){
              $code = $_GET['code'];
              $params = array('grant_type'=>'authorization_code',
                        'code'=>$code,
                        'client_id'=>$_SESSION['client_info']['client_id'],
                        'client_secret'=>$_SESSION['client_info']['client_secret'],
                        'redirect_uri'=>$_SESSION['client_info']['redirect_uri']
                       );
               try{
                     //getaccesstoken
                     $Rresponse = $_SESSION['guzzle']->request('POST','/oauth/token',['form_params'=>$params]);
                     if($Rresponse->getStatusCode()!=200)
                         {throw new Exception("failed");}

                     $body = $Rresponse->getBody();
                     $res = json_decode($body,true);
                     $result = $res['result']['data'];
                     $access_token = $result['access_token'];
                     $refresh_token = $result['refresh_token'];
                     $scope = $result['scope'];

                     //getuser
                     $Rresponse = $_SESSION['guzzle']->request('GET','/users/me',['headers'=>array('Content-Type'=>'application/json','Authorization'=>'Bearer '.$access_token)]);
                     if($Rresponse->getStatusCode()!=200)
                         {throw new Exception("failed");}
                     $body = $Rresponse->getBody();
                     $res = json_decode($body,true)["result"]["data"];

                     //addtodatabase
                     $db = new database();
                     $db = $db->connect();
                     $sql_query = '"'.$res['content']['username'].'","'.$access_token.'","'.$refresh_token.'","'.substr($res['content']['band'],0,1).'"';
                     $sql_query = "INSERT into users(username,accesstoken,refreshtoken,band) values (".$sql_query.");";
                     if($db->query($sql_query)==TRUE){
                       $cookie_name = "user";
                       $cookie_value = $res["content"]["username"];
                       setcookie($cookie_name, $cookie_value, time() + (86400 * 30), "/");
                       $response->getBody()->write(json_encode(
                         array("status"=>"OK","data"=>["message"=>"successfully logged in"])
                       ));
                     }
                     else{
                       $response->getBody()->write(json_encode(
                         array("status"=>"error","data"=>["message"=>"database error"])
                       ));
                     }

                 }catch(Exception $e){
                     $response->getBody()->write(json_encode(array("status"=>"error","data"=>["message"=>"server error"])));
                  }
      }
      else{
          $params = array('response_type'=>'code', 'client_id'=> $_SESSION['client_info']['client_id'], 'redirect_uri'=> $_SESSION['client_info']['redirect_uri'], 'state'=> 'xyz');
          header('Location: ' . $_SESSION['client_info']['authorization_code_endpoint'] . '?' . http_build_query($params));
          die();
      }

      return $response->withHeader('Content-Type', 'application/json');
});

//refresh route
$app->get('/refresh', function (Request $request, Response $response, $args) {
    $sql = "Select * from users where username ='".$_COOKIE['user']."';";
    try{
      //get refresh token from db
      $db = new database();
      $db = $db->connect();
      $statement = $db->query($sql);
      $user = $statement->fetchAll(PDO::FETCH_OBJ);
      $user = json_decode(json_encode($user[0]), true);
      $refresh_token = $user['refreshtoken'];
      $user = json_decode($user);

      //get new accesstoken
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
      $sql_str = "Update users set accesstoken = '".$access_token."',refreshtoken = '".$refresh_token."',logintime = NOW(),active = 'T' where username = '".$_COOKIE['user']."';";
      $db->query($sql_str);

      $response->getBody()->write(json_encode(
        array("status"=>"OK","data"=>["message"=>"successfully refreshed"])
      ));
    }catch(Exception $e){
      $response->getBody()->write(json_encode(array("status"=>"error","data"=>["message"=>"server error"])));
    }
    return $response->withHeader('Content-Type', 'application/json');
});


//logout route
$app->get('/logout', function(Request $request,Response $response,$args){
    $sql = "DELETE from users where username = '".$_COOKIE['user']."';";
    try{
        $db = new database();
        $db = $db->connect();
        if($db->query($sql)==TRUE){

              setcookie("user", "", time() - 3600);
              $response->getBody()->write(json_encode(
                array("status"=>"OK","data"=>["message"=>"logged out successfully"])
              ));
        }
        else{
          $response->getBody()->write(json_encode(
            array("status"=>"error","data"=>["message"=>"database error"])
          ));
        }
    }catch(Exception $e){
      $response->getBody()->write(json_encode(array("status"=>"error","data"=>["message"=>"server error"])));
    }
    return $response->withHeader('Content-Type', 'application/json');
});
