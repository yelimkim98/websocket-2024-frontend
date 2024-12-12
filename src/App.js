import './App.css';
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { Stomp } from "@stomp/stompjs";

const App = () => {
  //웹소켓 연결 객체
  const stompClient = useRef(null);
  
  // 메시지 리스트
  const [messages, setMessages] = new useState([]);

  // 사용자 입력을 저장할 변수
  const [inputValue, setInputValue] = useState('');

  // 입력 필드에 변화가 있을 때마다 inputValue를 업데이트
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  //메세지 전송
  const sendMessage = () => {
    if (stompClient.current && inputValue) {
      const body = {
        roomId : 1,
        userId : 2,
        message : inputValue
      };
      stompClient.current.send(`/pub/message`, {}, JSON.stringify(body));
      setInputValue('');
    }
  };
  
  useEffect(() => {
    connect();
    fetchMessages();
    // 컴포넌트 언마운트 시 웹소켓 연결 해제
    return () => disconnect();
  }, []);

  const connect = () => {
    //웹소켓 연결
    const socket = new WebSocket("ws://localhost:8080/ws");

    stompClient.current = Stomp.over(socket);
    stompClient.current.connect({}, 
      () => {
        stompClient.current.subscribe(`/sub/message/1`, 
          // 서버에서 메세지 발송 시 호출될 함수
          (message) => {
            // 누군가 발송했던 메시지를 리스트에 추가
            console.log("### 응답 옴 ###")
            console.log(message)
            console.log("###############")
            const newMessage = JSON.parse(message.body);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          });
      });
  };

  const fetchMessages = () => {
    return axios.get("http://localhost:8080/messages/1" )
            .then(response => {
              setMessages(response.data)
            });
  };

  const disconnect = () => {
    if (stompClient.current) {
      stompClient.current.disconnect();
    }
  };

  return (
    <div>
      <ul>
        <div>
          {/* 입력 필드 */}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
          />
          {/* 메시지 전송, 메시지 리스트에 추가 */}
          <button onClick={sendMessage}>입력</button>
        </div>
        {/* 메시지 리스트 출력 */}
        {messages.map((item, index) => (
          <div key={index} className="list-item">{item.message}</div>
        ))}
      </ul>
    </div>
  );
};

export default App
