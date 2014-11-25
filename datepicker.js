var Datepicker = React.createClass({
	getInitialState: function() {
		var current_date = this.props.current_date || new Date();
		return {
			active: false,
			current_date: current_date,
			cursor: 'from',
			date_from: this.props.date_from || current_date,
			date_to: this.props.date_to || current_date
		}
	},
	getPrevMonth: function(date) {
		var prev_month_date;
		if (date.getMonth() == 0) {
			prev_month_date = new Date(date.getFullYear() - 1, 11, 1);
		} else {
			prev_month_date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
		}
		return prev_month_date;
	},
	getNextMonth: function(date) {
		var next_month_date;
		if (date.getMonth() == 11) {
			next_month_date = new Date(date.getFullYear() + 1, 0, 1);
		} else {
			next_month_date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
		}
		return next_month_date;
	},
	goPrevMonth: function() {
		this.setState({
			current_date: this.getPrevMonth(this.state.current_date)
		});
	},
	goNextMonth: function() {
		this.setState({
			current_date: this.getNextMonth(this.state.current_date)
		});
	},
	setDate: function(date) {
		if (this.state.cursor == 'from') {
			this.setState({
				date_from: date,
				cursor: 'to'
			}, function() {
				if (this.state.date_from > this.state.date_to) {
					this.setState({
						date_to: date
					}, function() {
						this.onSetDate();
					});
				}
				this.onSetDate();
			});
		} else if (this.state.cursor == 'to') {
			this.setState({
				date_to: date,
				cursor: 'from'
			}, function() {
				this.onSetDate();
			});
		}
	},
	onSetDate: function() {
		if (this.props.onSetDate) {
			this.props.onSetDate({
				from: this.state.date_from,
				to: this.state.date_to
			});
		}
	},
	setCursor: function(cursor) {
		this.setState({
			cursor: cursor
		});
	},
	formatOutputDate: function(date) {
		return zeros(date.getDate(), 2) + '.' + zeros(date.getMonth() + 1, 2) + '.' + date.getFullYear();

		function zeros(number, size) {
			var result = number.toString();
			while (result.length < size) {
				result = '0' + result;
			}
			return result;
		}
	},
	show: function() {
		this.setState(React.addons.update(this.state, {
			active: { $set: true }
		}));
	},
	hide: function() {
		this.setState(React.addons.update(this.state, {
			active: { $set: false }
		}));
	},
	render: function() {
		var classes = React.addons.classSet({
			'datepicker': true,
			'datepicker-active': this.state.active
		});
		return(
			<div className={classes}>
				<ValueField
					show={this.show}
					date_from={this.formatOutputDate(this.state.date_from)}
					date_to={this.formatOutputDate(this.state.date_to)}
					formatOutputDate={this.formatOutputDate}/>
				<div className='datepicker-calendar'>
					<table>
						<tr>
							<td className="datepicker-months-section">
								<table>
									<tr>
										<td className="datepicker-prev" onClick={this.goPrevMonth}>◀</td>
										<td className="datepicker-months">
											<Months
												getPrevMonth={this.getPrevMonth}
												getNextMonth={this.getNextMonth}
												date={this.state.current_date}
												setDate={this.setDate}
												date_from={this.state.date_from}
												date_to={this.state.date_to}
												cursor={this.state.cursor}/>
										</td>
										<td className="datepicker-next" onClick={this.goNextMonth}>▶</td>
									</tr>
								</table>
							</td>
							<td className="datepicker-control-section">
								<div className="datepicker-control">
									<RangeSelector
										date_from={this.state.date_from}
										date_to={this.state.date_to}
										cursor={this.state.cursor}
										formatOutputDate={this.formatOutputDate}
										onFocus={this.setCursor}/>
									<div className='datepicker-control-buttons'>
										<SubmitButton
											hide={this.hide}
											value_node = {this.props.value_node}
											formatOutputDate={this.formatOutputDate}/>
									</div>
								</div>
							</td>
						</tr>
					</table>
				</div>
			</div>
		);
	},
	closeListener: function(event) {
		var target = event.target;
		if (target != this.getDOMNode() && !this.getDOMNode().contains(target)) {
			this.hide();
		}
	},
	componentDidMount: function() {
		document.addEventListener('click', this.closeListener);
	},
	componentWillUnmount: function() {
		document.removeEventListener('click', this.closeListener);
	}
});

var Months = React.createClass({
	render: function() {
		var months = [-1, 0, +1].map(function(index, i){
			var date;

			switch (index) {
				case -1:
					date = this.props.getPrevMonth(this.props.date);
					break;
				case 0:
					date = this.props.date;
					break;
				case 1:
					date = this.props.getNextMonth(this.props.date);
					break;
			}

			return(
				<td className="datepicker-month-col" key={date.getTime()}>
					<Month
						date={date}
						setDate={this.props.setDate}
						first_day='1'
						date_from={this.props.date_from}
						date_to={this.props.date_to}
						cursor={this.props.cursor}/>
				</td>
			);
		}.bind(this));


		return(
			<table>
				<tr>{months}</tr>
			</table>
		);
	}
});

var Month = React.createClass({
	getDaysInMonth: function(date) {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	},
	getDaysOfWeek: function() {
		return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
	},
	getMonthNames: function() {
		return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	},
	isToday: function(date) {
		return date.toDateString() == (new Date()).toDateString();
	},
	buildMonth: function(date) {
		var day = 0,
			days = [],
			WEEK_LENGTH = 7,
			max_days = this.getDaysInMonth(date),
			first_day_column = (new Date(date.getFullYear(), date.getMonth(), 1)).getDay() - this.props.first_day;
		var row, i, j, current_date;
		first_day_column = first_day_column < 0 ? 6 : first_day_column;

		var outside_day_data = {
			day: ' ',
			disabled: true
		};

		for (i = 0; day < max_days; i++) {
			row = [];
			days.push(row);
			for (j = 0; j < WEEK_LENGTH; j++) {
				if (i == 0 && j < first_day_column) {
					days[i][j] = outside_day_data;
				} else {
					day += 1;
					if (day <= max_days) {
						current_date = new Date(date.getFullYear(), date.getMonth(), day);
						days[i][j] = {
							day: day,
							date: current_date,
							today: this.isToday(current_date),
							disabled: isDisabled.call(this, current_date),
							in_range: isInRange.call(this, current_date)
						};
					} else {
						days[i][j] = outside_day_data;
					}
				}
			}
		}

		function isDisabled(date) {
			var disabled = false;
			var date_from = getDateFrom(this.props.date_from);
			date = getDateFrom(date);
			if (date < date_from && this.props.cursor == 'to') {
				disabled = true;
			}
			/*if (date > getTimeForDate(new Date())) {
				disabled = true;
			}*/
 			return disabled;
		}

		function isInRange(date) {
			var date_from = getDateFrom(this.props.date_from);
			date = getDateFrom(date);
			var date_to = getDateFrom(this.props.date_to);
			return date_from <= date && date <= date_to;
		}

		function getDateFrom(date) {
			return new Date(date.getFullYear(), date.getMonth(), date.getDate());
		}

		return days;
	},
	onDateSelect: function(event) {
		var selected_date = new Date(event.target.getAttribute('data-datepicker-date'));
		var is_disabled = event.target.getAttribute('data-disabled') == 'true';
		if (selected_date && !is_disabled) {
			this.props.setDate(selected_date);
		}
	},
	render: function() {
		// days
		var days = this.buildMonth(this.props.date);
		var data = days.map(function(row, index) {
			var td = row.map(function(cell, index) {
				var classes = React.addons.classSet({
					'datepicker-cell': true,
					'datepicker-today': cell.today,
					'datepicker-disabled-day': cell.disabled,
					'datepicker-day': !cell.disabled,
					'datepicker-day-range': cell.in_range
				});
				return (<td
					key={index}
					data-datepicker-date={cell.date}
					data-disabled={cell.disabled}
					className={classes}
					onClick={this.onDateSelect}>{cell.day}</td>);
			}, this);
			return <tr key={index}>{td}</tr>;
		}, this);

		// week names
		var day_of_week_names = this.getDaysOfWeek(),
			day_of_week;
		day_of_week_names = day_of_week_names.concat(day_of_week_names.splice(0, this.props.first_day));
		day_of_week = day_of_week_names.map(function(day_of_week_name, index) {
			return (<th className='datepicker-cell datepicker-day-of-week' key={index}>{day_of_week_name}</th>);
		});

		// month name
		var month_name_node = <th colSpan='7' className='datepicker-month-name'>{this.getMonthNames()[this.props.date.getMonth()] + ', ' + this.props.date.getFullYear()}</th>;

		return(
			<table className='datepicker-month'>
				<thead>
					<tr>{month_name_node}</tr>
					<tr className='datepicker-days-of-week'>{day_of_week}</tr>
				</thead>
				<tbody>{data}</tbody>
			</table>
		);
	}
});

var RangeSelector = React.createClass({
	onFocus: function(cursor) {
		this.props.onFocus(event.target.getAttribute('data-datepicker-date'));
	},
	/*
	componentWillUpdate: function() {
		this.refs.from.getDOMNode().value = this.props.formatOutputDate(this.props.date_from);
		this.refs.to.getDOMNode().value = this.props.formatOutputDate(this.props.date_to);
	},
	*/
	render: function() {
		var from_classes = React.addons.classSet({
			'datepicker-range-field': true,
			'datepicker-range-cursor': this.props.cursor == 'from'
		});
		var to_classes = React.addons.classSet({
			'datepicker-range-field': true,
			'datepicker-range-cursor': this.props.cursor == 'to'
		});
		return (
			<div className='datepicker-range-selector'>
				<input
					data-datepicker-date="from"
					type='text'
					ref='from'
					value={this.props.formatOutputDate(this.props.date_from)}
					className={from_classes}
					onFocus={this.onFocus} />
				<span>-</span>
				<input
					data-datepicker-date="to"
					type='text'
					ref='to'
					value={this.props.formatOutputDate(this.props.date_to)}
					className={to_classes}
					onFocus={this.onFocus} />
			</div>
		);
	}
});

var SubmitButton = React.createClass({
	onClick: function(event) {
		event.preventDefault();
		this.props.hide();
	},
	render: function() {
		return (
			<a href='#' className='datepicker-button' onClick={this.onClick}>Apply</a>
		);
	}
});

var ValueField = React.createClass({
	onClick: function(event) {
		this.props.show();
	},
	render: function() {
		return (
			<div
				onClick={this.onClick}
				className='datepicker-value'>{this.props.date_from} - {this.props.date_to}</div>
		);
	}
});