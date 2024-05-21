package org.example;

import kong.unirest.core.HttpResponse;
import kong.unirest.core.Unirest;
import java.io.*;
import java.util.Base64;
import javax.sound.sampled.*;

public class Main {
    public static void main(String[] args) throws IOException, LineUnavailableException {
        HttpResponse<String> response = Unirest.post("https://shazam.p.rapidapi.com/songs/detect")
                .header("content-type", "text/plain")
                .header("X-RapidAPI-Key", "0bfb0321bbmsh8e25be16e31863dp15994cjsnc481a9a41b94")
                .header("X-RapidAPI-Host", "shazam.p.rapidapi.com")
                .body(micInputParser())
//                .body(soundFileParser("clinteastwood_portion_mono.raw"))
                .asString();

        // get title and author from response
        String body = response.getBody();
        String title = body.split("\"title\":")[1].split("\"")[1];
        String author = body.split("trackartist}\":")[1].split("\"")[1];

        System.out.println(title);
        System.out.println(author);

//        System.out.println(response.getBody());
    }

    public static String soundFileParser(String rawFileName) throws IOException {
        FileInputStream input = new FileInputStream(rawFileName);
        byte[] byteArray = input.readAllBytes();
        String base64Str = Base64.getEncoder().encodeToString(byteArray);
        return base64Str;
    }

    public static String micInputParser() throws LineUnavailableException {
        byte[] data = getMicrophoneInput();
        String base64Str = Base64.getEncoder().encodeToString(data);
        return base64Str;
    }

    public static byte[] getMicrophoneInput() throws LineUnavailableException {
        // set up mic
        AudioFormat format = new AudioFormat(44100.0f, 16, 1, true, false);
        TargetDataLine mic = AudioSystem.getTargetDataLine(format);

        // set up byte[] to hold sound data
        byte[] soundData = new byte[400000];

        // read sound data from mic
        mic.open(format);
        System.out.println("Starting sound collection...");
        mic.start();
        mic.read(soundData, 0, soundData.length);
        mic.stop();
        System.out.println("Sound collection finished.");

        // return sound data for parsing
        return soundData;
    }
}