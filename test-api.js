// 使用Node.js 24内置的fetch API

async function testChatAPI() {
  try {
    console.log('Testing /api/chat endpoint...');
    
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        question: '敲门的人是被山顶的人杀死的吗？',
        story: {
          title: '神秘的敲门声',
          surface: '一个人住在山顶的小屋里，半夜听见有敲门声，他打开门却没有人，于是去睡了。等了一会儿又有敲门声，去开门还是没人，如是者几次。第二天，有人在山脚下发现死尸一具，警察来把山顶的那人带走了。',
          bottom: '因为山顶的小屋门是向外开的，当他开门时，敲门的人被门推下山去，如此反复，导致敲门者死亡。'
        }
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    // 使用Buffer来处理响应，确保正确解码utf-8字符
    const buffer = await response.arrayBuffer();
    const text = new TextDecoder('utf-8').decode(buffer);
    console.log('Response text:', text);
    const data = JSON.parse(text);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

async function testTestAPI() {
  try {
    console.log('\nTesting /api/test endpoint...');
    
    const response = await fetch('http://localhost:3001/api/test');
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

async function testRootAPI() {
  try {
    console.log('\nTesting / endpoint...');
    
    const response = await fetch('http://localhost:3001/');
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

async function testGenerateStoryAPI() {
  try {
    console.log('\nTesting /api/generate-story endpoint...');
    
    const response = await fetch('http://localhost:3001/api/generate-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run tests
testRootAPI()
  .then(() => testTestAPI())
  .then(() => testChatAPI())
  .then(() => testGenerateStoryAPI())
  .catch(console.error);
