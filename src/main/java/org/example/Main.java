package org.example;

import kong.unirest.core.HttpResponse;
import kong.unirest.core.Unirest;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class Main {
    public static void main(String[] args) throws IOException {
        HttpResponse<String> response = Unirest.post("https://shazam.p.rapidapi.com/songs/detect")
                .header("content-type", "text/plain")
                .header("X-RapidAPI-Key", "0bfb0321bbmsh8e25be16e31863dp15994cjsnc481a9a41b94")
                .header("X-RapidAPI-Host", "shazam.p.rapidapi.com")
                .body(soundFileParser("clinteastwood_portion_mono.raw"))
                .asString();

        // get title from response
        String body = response.getBody();
        String title = body.split("\"title\":")[1].split("\"")[1];

        System.out.println(title);

//        System.out.println(response.getBody().charAt(titleIndex));
//        System.out.println(response.getBody());
    }

    public static String soundFileParser(String rawFileName) throws IOException {
        FileInputStream input = new FileInputStream(rawFileName);
        byte[] byteArray = input.readAllBytes();
        String base64Str = Base64.getEncoder().encodeToString(byteArray);
        return base64Str;
    }
}