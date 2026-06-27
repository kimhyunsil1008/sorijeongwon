const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

const dataFile = path.join(__dirname, 'data.json');
const studentsFile = path.join(__dirname, 'students.json');

// 데이터 초기화
function initData() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({ records: [] }));
  }
}

// API: 학생 목록 조회
app.get('/api/students', (req, res) => {
  try {
    const students = JSON.parse(fs.readFileSync(studentsFile, 'utf-8'));
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: '학생 목록 읽기 실패' });
  }
});

// API: 연습 기록 조회
app.get('/api/practice-list', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    res.json(data.records);
  } catch (error) {
    res.status(500).json({ error: '기록 조회 실패' });
  }
});

// API: 연습 기록 저장
app.post('/api/practice', (req, res) => {
  try {
    const { studentName, hours, minutes, date, time } = req.body;
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

    data.records.push({
      date: date || new Date().toISOString().split('T')[0],
      time: time || '',
      student: studentName,
      hours: parseInt(hours),
      minutes: parseInt(minutes),
      totalMinutes: parseInt(hours) * 60 + parseInt(minutes)
    });

    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '저장 실패' });
  }
});

// API: 통계 조회
app.get('/api/stats/:type', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    const type = req.params.type;

    let stats = {};
    const today = new Date();
    let startDate = new Date();

    if (type === 'day') {
      startDate.setHours(0, 0, 0, 0);
    } else if (type === 'week') {
      startDate.setDate(today.getDate() - today.getDay());
      startDate.setHours(0, 0, 0, 0);
    } else if (type === 'month') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    data.records.forEach(record => {
      const recordDate = new Date(record.date);
      if (recordDate >= startDate) {
        if (!stats[record.student]) stats[record.student] = 0;
        stats[record.student] += record.totalMinutes / 60;
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: '통계 조회 실패' });
  }
});

// API: 학생 추가
app.post('/api/students/add', (req, res) => {
  try {
    const { name } = req.body;
    const students = JSON.parse(fs.readFileSync(studentsFile, 'utf-8'));

    if (!students.includes(name)) {
      students.push(name);
      fs.writeFileSync(studentsFile, JSON.stringify(students, null, 2));
      res.json({ success: true });
    } else {
      res.status(400).json({ error: '이미 존재하는 학생입니다' });
    }
  } catch (error) {
    res.status(500).json({ error: '추가 실패' });
  }
});

// API: 학생 삭제
app.post('/api/students/delete', (req, res) => {
  try {
    const { name } = req.body;
    let students = JSON.parse(fs.readFileSync(studentsFile, 'utf-8'));

    students = students.filter(s => s !== name);
    fs.writeFileSync(studentsFile, JSON.stringify(students, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '삭제 실패' });
  }
});

// API: 전체 데이터 초기화
app.post('/api/reset', (req, res) => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify({ records: [] }));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '초기화 실패' });
  }
});

// API: 특정 기록 삭제
app.post('/api/practice/delete', (req, res) => {
  try {
    const { recordIndex } = req.body;
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

    if (recordIndex >= 0 && recordIndex < data.records.length) {
      data.records.splice(recordIndex, 1);
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
      res.json({ success: true });
    } else {
      res.status(400).json({ error: '잘못된 인덱스' });
    }
  } catch (error) {
    res.status(500).json({ error: '삭제 실패' });
  }
});

// API: 특정 학생의 모든 기록 삭제
app.post('/api/practice/delete-student', (req, res) => {
  try {
    const { studentName } = req.body;
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

    data.records = data.records.filter(record => record.student !== studentName);
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '학생 기록 삭제 실패' });
  }
});

// 서버 시작
initData();
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🎓 소리정원 서버 시작!');
  console.log('='.repeat(50));
  console.log('\n✅ 맥북: http://localhost:3000');
  console.log('✅ 핸드폰: http://[맥북IP]:3000');
  console.log('\n📱 핸드폰 Safari에서 위 주소 입력');
  console.log('🔗 홈화면에 추가하면 앱처럼 사용 가능!\n');
  console.log('⚠️  이 창을 닫으면 서버가 종료됩니다');
  console.log('종료: Ctrl+C\n' + '='.repeat(50) + '\n');
});
