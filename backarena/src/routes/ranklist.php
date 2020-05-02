<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/ranklist/{name}', function (Request $request, Response $response, $args) {

    $contest_name = $request->getAttribute('name');

    try{
      $db = new database();
      $db = $db->connect();
      $sql_query = "Update users set active='F' where TIMEDIFF(NOW(),logintime)>='01:00:00';";
      $statement = $db->query($sql_query);
      $sql_query = "Select accesstoken,refreshtoken,active from users where username ='".$_GET['user']."';";
      $statement = $db->query($sql_query);
      $user = $statement->fetchAll(PDO::FETCH_OBJ);
      $user = json_decode(json_encode($user[0]), true);
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

      $Rresponse = $_SESSION['guzzle']->request('GET','/rankings/'.$contest_name,['headers'=>array('Content-Type'=>'application/json','Authorization'=>'Bearer '.$access_token)]);
      if($Rresponse->getStatusCode()!=200)
          {throw new Exception("failed");}
      $body = $Rresponse->getBody();
      $res = json_decode($body,true);
      $response->getBody()->write(json_encode($res));
    }
    catch(Exception $e){
      $response->getBody()->write($e->getMessage());
    }

    return $response->withHeader('Content-Type', 'application/json');
});
