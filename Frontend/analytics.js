function bar_chart() {
    const DUMMY_BARS = [
        { id: 'd1', value: 10, region: 'USA' },
        { id: 'd2', value: 11, region: 'India' },
        { id: 'd3', value: 12, region: 'China' },
        { id: 'd4', value: 6, region: 'Germany' }
    ]

    const xScaleBar = d3.scaleBand().domain(DUMMY_BARS.map(pt => pt.region)).rangeRound([0, 250]).padding(0.1)
    const yScaleBar = d3.scaleLinear().domain([0, 15]).range([200, 0])

    const containerBar = d3.select('#bar-chart')
        .classed('container', true)

    const bars = containerBar.selectAll('.bar')
        .data(DUMMY_BARS)
        .enter()
        .append('rect')
        .classed('bar', true)
        .attr('width', xScaleBar.bandwidth())
        .attr('height', data => 200 - yScaleBar(data.value))
        .attr('x', data => xScaleBar(data.region))
        .attr('y', data => yScaleBar(data.value))
}

function line_plot() {
    const margin = { top: 10, right: 30, bottom: 30, left: 60 }
    const width = 460 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const DUMMY_VISITS = [
        { visits: 0, date: new Date('2024-02-10') },
        { visits: 0, date: new Date('2024-02-11') },
        { visits: 2, date: new Date('2024-02-12') },
        { visits: 2, date: new Date('2024-02-13') },
        { visits: 3, date: new Date('2024-02-14') },
        { visits: 6, date: new Date('2024-02-15') },
        { visits: 12, date: new Date('2024-02-16') },
        { visits: 23, date: new Date('2024-02-17') },
        { visits: 27, date: new Date('2024-02-18') },
        { visits: 30, date: new Date('2024-02-19') },
        { visits: 23, date: new Date('2024-02-20') },
        { visits: 20, date: new Date('2024-02-21') },
        { visits: 24, date: new Date('2024-02-22') },
        { visits: 25, date: new Date('2024-02-23') },
        { visits: 24, date: new Date('2024-02-24') },
        { visits: 32, date: new Date('2024-02-25') }
    ]

    const svg = d3.select('#line-plot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    const x = d3.scaleTime().domain(d3.extent(DUMMY_VISITS, d => d.date)).range([0, width])
    const y = d3.scaleLinear().domain([0, d3.max(DUMMY_VISITS, d => d.visits)]).range([height, 0])

    svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x))
    svg.append('g')
        .call(d3.axisLeft(y))

    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.visits))

    svg.append('path')
        .datum(DUMMY_VISITS)
        .attr('fill', 'none')
        .attr('stroke', '#7eef32')
        .attr('stroke-width', 4)
        .attr('d', line)

    // Create a tooltip div
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')

    const circle = svg.append('circle')
        .attr('r', 0)
        .attr('fill', 'steelblue')
        .style('stroke', 'white')
        .attr('opacity', 0.7)
        .style('pointer-events', 'none')

    const listeningRect = svg.append('rect')
        .attr('width', width)
        .attr('height', height)

    listeningRect.on('mousemove', (event) => {
        const [xCoord] = d3.pointer(event, this)
        const bisectDate = d3.bisector(d => d.date).left
        const x0 = x.invert(xCoord)
        const i = bisectDate(DUMMY_VISITS, x0, 1)
        const d0 = DUMMY_VISITS[i - 1]
        const d1 = DUMMY_VISITS[i]
        const d = x0 - d0.date > d1.date - x0 ? d1 : d0
        const xPos = x(d.date)
        const yPos = y(d.population)

        circle.attr('cx', xPos)
            .attr('cy', yPos)

        circle.transition()
            .duration(50)
            .attr('r', 5)
        
        tooltip
            .style('display', 'block')
            .style('left', `${xPos + 100}px`)
            .style('top', `${yPos + 50}px`)
            .html(`<strong>Date:</strong> ${d.date.toLocaleDateString()}<br><strong>Visits:</strong> ${d.visits}`)

        listeningRect.on("mouseleave", function () {
            circle.transition()
                .duration(50)
                .attr("r", 0);
        
            tooltip.style("display", "none");
        });
    })
}

bar_chart()
line_plot()