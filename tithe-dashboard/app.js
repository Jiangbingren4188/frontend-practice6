const state = { data: null, region: 'all' };

const loadData = async () => {
  $('#status').text('加载中...').show();
  try {
    const response = await fetch('data/tithe.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (data.regions.length === 0) {
      $('#status').text('暂无数据').show();
      return;
    }
    state.data = data;
    $('#sub-title').text(data.title + ' · 数据来源：' + data.source);
    $('#status').hide();
    renderFilters(data);
    renderAll();
  } catch (error) {
    $('#status').text('加载失败：' + error.message).show();
  }
};

const renderCards = (data) => {
  const years = data.years;
  const unit = data.unit;
  $('#cards').empty();
  data.regions.forEach(r => {
    const total = r.amounts.reduce((sum, n) => sum + n, 0);
    $('#cards').append(`
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title h6">${r.name}</h3>
            <p class="card-text fs-4">${total}</p>
            <p class="card-text small text-muted">共${years.length}年累计（${unit}）</p>
          </div>
        </div>
      </div>
    `);
  });
};

let barChart = null;

const renderBarChart = (data) => {
  if (barChart === null) {
    barChart = echarts.init(document.querySelector('#bar-chart'));
  }
  barChart.setOption({
    title: { text: '各地区什一税额（单位：' + data.unit + '）', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    xAxis: { data: data.years },
    yAxis: { name: data.unit },
    series: data.regions.map(r => ({
      name: r.name,
      type: 'bar',
      data: r.amounts
    }))
  }, true);
};

let lineChart = null;

const renderLineChart = (data) => {
  if (lineChart !== null) {
    lineChart.destroy();
  }
  const ctx = document.querySelector('#line-chart');
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.years,
      datasets: data.regions.map(r => ({
        label: r.name,
        data: r.amounts,
        borderWidth: 1
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: '什一税缴纳趋势（单位：' + data.unit + '）' }
      }
    }
  });
};

const renderFilters = (data) => {
  const buttons = ['<button type="button" class="filter-btn btn btn-outline-primary active" data-region="all">全部</button>'];
  data.regions.forEach(r => {
    buttons.push(`<button type="button" class="filter-btn btn btn-outline-primary" data-region="${r.name}">${r.name}</button>`);
  });
  $('#filters').html(buttons.join(''));
};

const getFilteredData = () => {
  if (state.region === 'all') {
    return state.data;
  }
  return {
    ...state.data,
    regions: state.data.regions.filter(r => r.name === state.region)
  };
};

const renderAll = () => {
  const data = getFilteredData();
  renderCards(data);
  renderBarChart(data);
  renderLineChart(data);
};

$('#filters').on('click', '.filter-btn', function () {
  state.region = $(this).data('region');
  $('.filter-btn').removeClass('active');
  $(this).addClass('active');
  renderAll();
});

window.addEventListener('resize', () => {
  if (barChart) barChart.resize();
});

loadData();
