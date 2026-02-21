import { useState, useEffect } from 'react';  
import { Chart } from 'react-google-charts';

export default function AdminStats() {
  const [charts, setCharts] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/admin/stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(r => {
        if (!r.ok) throw new Error("Status: " + r.status);
        return r.json();
      })
      .then(data => {
        setCharts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Greška:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white text-xl">Loading stats...</div>
            </div>
        );
    }

 
  if (!charts || !charts.modes || !charts.top_users || !charts.roles) {
    return <div className="p-10 text-center text-red-500">Data is not available.</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-black-50 min-h-screen">
      
      {/*  Summary Kartice */}
      <div className="grid grid-cols-1  md:grid-cols-3 gap-6">
        <div className="bg-white p-6 bg-zinc-300 rounded-xl shadow-sm border-b-4 border-blue-500">
          <p className="text-gray-500 text-xs uppercase font-bold">Users</p>
          <h2 className="text-2xl font-black">{charts.summary.total_users}</h2>
        </div>
        <div className="bg-white p-6 bg-zinc-300 rounded-xl shadow-sm border-b-4 border-green-500">
          <p className="text-gray-500  text-xs uppercase font-bold">Chats</p>
          <h2 className="text-2xl font-black">{charts.summary.total_chats}</h2>
        </div>
        <div className="bg-white p-6 bg-zinc-300 rounded-xl shadow-sm border-b-4 border-red-500">
          <p className="text-gray-500 text-xs uppercase font-bold">Average messages per chat</p>
          <h2 className="text-2xl font-black">{charts.summary.avg_chat_length} </h2>
        </div>
      </div>

      <div className="grid  md:grid-cols-2 gap-6">
        {/* Pie chart - modovi */}
        <div className="bg-white p-6 bg-zinc-300 rounded-xl shadow-sm text-center">
          <h3 className="font-bold  mb-4">Popularity of mods</h3>
          <Chart 
            chartType="PieChart" 
            
            data={charts.modes} 
            width="100%"
            height="300px" 
            options={{ pieHole: 0, chartArea: {width: '90%', height: '80%'} ,legend:{position:'right',textStyle:{fontSize:12}},
                    backgroundColor: 'transparent'
        
                    }}
          />
        </div>
        
        {/* Pie chart uloge */}
        <div className="bg-white bg-zinc-300 p-6 rounded-xl shadow-sm text-center">
          <h3 className="font-bold mb-4">User roles</h3>
          <Chart 
            chartType="PieChart" 
            data={charts.roles} 
            width="100%"
            height="300px" 
            
            options={{ colors: ['#e85d07', '#b91010', '#0b2ef5'],pieHole: 0, chartArea: {width: '90%', height: '80%'} ,
            legend:{position:'right',textStyle:{fontSize:12}}, backgroundColor: 'transparent' }}
          />
        </div>
      </div>
      
      {/* Top Korisnici */}
      <div className="bg-white p-6 bg-zinc-300 rounded-xl shadow-sm">
        <h3 className="font-bold mb-4">Most active users</h3>
        <Chart 

          chartType="BarChart" 
          data={charts.top_users} 
          width="100%"
          height="300px" 
          options={{ legend: { position: 'none' }, hAxis: { minValue: 0 }, chartArea: { left: '23%', width: '60%', height: '80%' },
          backgroundColor: 'transparent'
        }}
        />
      </div>
    </div>
  );
}