var M_WIDTH=800, M_HEIGHT=450;
var app, game_res, game, objects={}, LANG = 0, state="", game_tick=0, game_id=0, connected = 1, h_state=0, game_platform="",
hidden_state_start = 0,room_name = 'states2', pending_player='', opponent = {}, my_data={opp_id : ''},
opp_data={}, some_process = {}, git_src = '', ME = 0, OPP = 1, WIN = 1, DRAW = 0, LOSE = -1, NOSYNC = 2, MY_TURN = 0, OPP_TURN = 1, turn = 0, BET = 0, RAISE = 1, FOLD = 2, CALL = 3, CHECK = 4, BIG_BLIND = 2;

const suit_num_to_txt = ['h','d','s','c'], MIN_CHIPS = 20;
const value_num_to_txt = ['0','1','2','3','4','5','6','7','8','9','10','J','Q','K','A'];

irnd = function(min,max) {	
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class player_mini_card_class extends PIXI.Container {

	constructor(x,y,id) {
		super();
		this.visible=false;
		this.id=id;
		this.uid=0;
		this.type = "single";
		this.x=x;
		this.y=y;
		this.bcg=new PIXI.Sprite(game_res.resources.mini_player_card.texture);
		this.bcg.interactive=true;
		this.bcg.buttonMode=true;
		this.bcg.pointerdown=function(){cards_menu.card_down(id)};
		this.bcg.pointerover=function(){this.bcg.alpha=0.5;}.bind(this);
		this.bcg.pointerout=function(){this.bcg.alpha=1;}.bind(this);
		this.bcg.width=200;
		this.bcg.height=100;

		this.avatar=new PIXI.Sprite();
		this.avatar.x=20;
		this.avatar.y=20;
		this.avatar.width=this.avatar.height=60;

		this.name="";
		this.name_text=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 20,align: 'center'});
		this.name_text.anchor.set(0.5,0.5);
		this.name_text.x=135;
		this.name_text.y=35;

		this.rating=0;
		this.rating_text=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 24,align: 'center'});
		this.rating_text.tint=0xffff00;
		this.rating_text.anchor.set(0.5,0.5);
		this.rating_text.x=135;
		this.rating_text.y=70;

		//аватар первого игрока
		this.avatar1=new PIXI.Sprite();
		this.avatar1.x=20;
		this.avatar1.y=20;
		this.avatar1.width=this.avatar1.height=60;

		//аватар второго игрока
		this.avatar2=new PIXI.Sprite();
		this.avatar2.x=120;
		this.avatar2.y=20;
		this.avatar2.width=this.avatar2.height=60;

		this.rating_text1=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 18,align: 'center'});
		this.rating_text1.tint=0xffff00;
		this.rating_text1.anchor.set(0.5,0);
		this.rating_text1.x=50;
		this.rating_text1.y=70;

		this.rating_text2=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 18,align: 'center'});
		this.rating_text2.tint=0xffff00;
		this.rating_text2.anchor.set(0.5,0);
		this.rating_text2.x=150;
		this.rating_text2.y=70;
		
		//
		this.rating_bcg = new PIXI.Sprite(game_res.resources.rating_bcg.texture);
		this.rating_bcg.width=200;
		this.rating_bcg.height=100;
		
		this.name1="";
		this.name2="";

		this.addChild(this.bcg,this.avatar, this.avatar1, this.avatar2, this.rating_bcg, this.rating_text,this.rating_text1,this.rating_text2, this.name_text);
	}

}

class lb_player_card_class extends PIXI.Container{

	constructor(x,y,place) {
		super();

		this.bcg=new PIXI.Sprite(game_res.resources.lb_player_card_bcg.texture);
		this.bcg.interactive=true;
		this.bcg.pointerover=function(){this.tint=0x55ffff};
		this.bcg.pointerout=function(){this.tint=0xffffff};
		this.bcg.width = 370;
		this.bcg.height = 70;

		this.place=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.place.tint=0xffff00;
		this.place.x=20;
		this.place.y=22;

		this.avatar=new PIXI.Sprite();
		this.avatar.x=43;
		this.avatar.y=10;
		this.avatar.width=this.avatar.height=48;


		this.name=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.name.tint=0xdddddd;
		this.name.x=105;
		this.name.y=22;


		this.rating=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.rating.x=298;
		this.rating.tint=0xff55ff;
		this.rating.y=22;

		this.addChild(this.bcg,this.place, this.avatar, this.name, this.rating);
	}


}

class playing_cards_class extends PIXI.Container {
	
	constructor() {
		
		super();
		this.value_num = 0;
		this.value_txt = '';
		
		this.suit_num = 0;
		this.suit_txt = '';
		
		this.visible = false;
					
		this.bcg = new PIXI.Sprite(gres.pcard_bcg.texture);
		this.bcg.anchor.set(0.5,0.5);	
							
		this.suit_img = new PIXI.Sprite();
		this.suit_img.anchor.set(0.5,0.5);
		
		this.text_value = new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 50});
		this.text_value.anchor.set(0.5,0.5);
		this.text_value.y=-24;
						
		this.addChild(this.bcg, this.suit_img, this.text_value);
	}	
		
	set (card_data) {
		
		this.value_num = card_data[0];
		this.suit_num = card_data[1];
		
		//текстовые значения
		this.value_txt = value_num_to_txt[this.value_num];
		this.suit_txt = suit_num_to_txt[this.suit_num];
		
		
		this.suit_img.texture = gres[this.suit_txt+'_bcg'].texture;
		this.text_value.text = this.value_txt;		
		
		if (this.suit_txt === 'h' || this.suit_txt === 'd')
			this.text_value.tint = 0xff0000;
		else
			this.text_value.tint = 0x000000;
		
	}
	
	set_shirt () {
		//return
		this.text_value.visible = false;
		this.suit_img.texture = gres.cards_shirt.texture;		
		
	}
		
	async open () {
		
		sound.play('card_open');
		await anim2.add(this,{scale_x:[1, 0]}, false, 0.2,'linear');		
		this.text_value.visible = true;
		this.suit_img.texture = gres[this.suit_txt + '_bcg'].texture;
		await anim2.add(this,{scale_x:[0, 1]}, true, 0.2,'linear');	
		
	}	
	
	
}

big_deck = {
	
	cards : [],
			
	init : function (seed) {
		
		this.cards = [
		[2,0,0],
		[3,0,0],
		[4,0,0],
		[5,0,0],
		[6,0,0],
		[7,0,0],
		[8,0,0],
		[9,0,0],
		[10,0,0],
		[11,0,0],
		[12,0,0],
		[13,0,0],
		[14,0,0],
		[2,1,0],
		[3,1,0],
		[4,1,0],
		[5,1,0],
		[6,1,0],
		[7,1,0],
		[8,1,0],
		[9,1,0],
		[10,1,0],
		[11,1,0],
		[12,1,0],
		[13,1,0],
		[14,1,0],
		[2,2,0],
		[3,2,0],
		[4,2,0],
		[5,2,0],
		[6,2,0],
		[7,2,0],
		[8,2,0],
		[9,2,0],
		[10,2,0],
		[11,2,0],
		[12,2,0],
		[13,2,0],
		[14,2,0],
		[2,3,0],
		[3,3,0],
		[4,3,0],
		[5,3,0],
		[6,3,0],
		[7,3,0],
		[8,3,0],
		[9,3,0],
		[10,3,0],
		[11,3,0],
		[12,3,0],
		[13,3,0],
		[14,3,0]];
		
		this.shuffle(seed);
				
	},
		
	get_random_num : function * (seed) {
		
		let value = seed;
		while(true) {
			value = value * 16807 % 2147483647
			yield value;
		}

	},
			
	shuffle : function(shuffle_seed) {
		
		//добавляем случайное число
		let generator = this.get_random_num(shuffle_seed);
		this.cards.forEach (c => {c[2] = generator.next().value;});
		
		//сортируем карты и как бы тусуем их получается
		this.cards = this.cards.sort(function(a, b) {return a[2] - b[2]});
				
		
	}

	
}

class deck_class {
	
	constructor(type) {
		
		//массив карт
		this.cards = [];
		this.size = 0;
		this.type = type;
		
	}
		
	* get_random_num (seed) {
		
		let value = seed;
		while(true) {
			value = value * 16807 % 2147483647
			yield value;
		}

	}
		
	init_big (shuffle_seed) {
		
		deck_data = [
		['2','h',0],
		['3','h',0],
		['4','h',0],
		['5','h',0],
		['6','h',0],
		['7','h',0],
		['8','h',0],
		['9','h',0],
		['10','h',0],
		['J','h',0],
		['Q','h',0],
		['K','h',0],
		['A','h',0],
		['2','d',0],
		['3','d',0],
		['4','d',0],
		['5','d',0],
		['6','d',0],
		['7','d',0],
		['8','d',0],
		['9','d',0],
		['10','d',0],
		['J','d',0],
		['Q','d',0],
		['K','d',0],
		['A','d',0],
		['2','s',0],
		['3','s',0],
		['4','s',0],
		['5','s',0],
		['6','s',0],
		['7','s',0],
		['8','s',0],
		['9','s',0],
		['10','s',0],
		['J','s',0],
		['Q','s',0],
		['K','s',0],
		['A','s',0],
		['2','c',0],
		['3','c',0],
		['4','c',0],
		['5','c',0],
		['6','c',0],
		['7','c',0],
		['8','c',0],
		['9','c',0],
		['10','c',0],
		['J','c',0],
		['Q','c',0],
		['K','c',0],
		['A','c',0]
		]
			
		let context = this;
		let generator = this.get_random_num(shuffle_seed);
		
		
		objects.pcards.forEach (c => {			
			c.rnum = generator.next().value;
			context.push(c);
		});
		
	}
	
	push (card) {
		
		//добавляем карту в колоду
		if (this.type === 'my' || this.type === 'opp')
			card.visible = true;
		
		if (this.type === 'opp')
			card.set_shirt();
		
		if (this.type === 'my')
			card.unshirt();
		
		this.cards.push(card);
		this.size++;
	}
	
	pop (card) {
		
		if (this.size === 0)
			alert('Колода пустая!!! 246')
		
		//если карта не указана возвращаем последнюю в колоде
		if (card === undefined) {
			this.size--;
			return this.cards.pop();
		}
		
		//получаем айди карты
		let card_id = card.id;
		
		//возвращаем ее по айди
		return this.pop_by_id(card_id);
		
	}
	
	pop_by_id (card_id) {
		
		if (this.size === 0)
			alert('Колода пустая!!! 265')
				
		//убираем карту из колоды и возвращаем ее

		let index = this.cards.findIndex(x => x.id === card_id);	
		if (index === -1) {
			alert('Не нашли индекс в колоде!!!')			
			throw Error()
		}

		this.size--;
		return this.cards.splice(index, 1)[0];	
		
	}
	
	include_card (card) {
		
		if (this.cards.find( c => c.id === card.id) === undefined)
			return false;
		
		return true;		
	}
	
	include_value (value) {
		
		if (this.cards.find( c => c.value === value) === undefined)
			return false;
		
		return true;	
		
	}
	
	make_empty () {
		
		this.cards = [];
		this.size = 0;
		
	}
	
	shuffle () {
		
		this.cards = this.cards.sort(function(a, b) {return a.rnum - b.rnum});
		
	}
		
	get_last_card () {
		

		if (this.size === 0)
			alert('get_last_card - нету карт!!!')
		
		return this.cards[this.size - 1];
		
	}
	
	get_last_card_pos_x () {
		

		if (this.size === 0)	return 340;		
		return this.cards[this.size - 1].x;
		
	}
	
	get_first_card () {
		
		return this.cards[0];
		
	}
	
	organize () {
		
		if (this.size === 0) return;		
		
		//положение карт по вертикали
		let tar_y = this.type === 'my' ? 400 : 50;
		
		let tar_card_width = 73.5;
		let interval = 73.5;
		
		if (this.size < 11) {			
			tar_card_width = 73.5;
			interval = 68;
		}
		
		if (this.size >= 11 && this.size < 15) {			
			tar_card_width = 65;
			interval = 53;
		}
		
		if (this.size >= 15 && this.size < 23) {			
			tar_card_width = 45;
			interval = 35;
		}
		
		if (this.size >= 23) {			
			tar_card_width = 35;
			interval = 28;
		}
		
		if (this.size >= 25) {			
			tar_card_width = 35;
			interval = 22;
		}
				
		let tar_card_scale = tar_card_width / 105;
		
		this.cards.forEach(c=> c.scale_xy = tar_card_scale);
		
		//сортируем карты по возрастанию для удобства работы с ними
		this.cards.sort(function(a, b) {return a.id - b.id});
				
		//let card_width = this.cards[0].width * 0.8;		
		let deck_width = tar_card_width * this.size;
		let deck_start = 0;
		
		if (this.size === 1) deck_start = 400;						
				
		if (this.size > 1) {			
			deck_width = interval * (this.size);
			deck_start = 400 - deck_width / 2 + tar_card_width / 2;			
		}
			
			
			
		this.cards.forEach((c,i)=> {
			if (this.type === 'my' && c.suit === table.trump.suit)
				c.trump_hl.visible = true;
			c.y = tar_y;			
			let tar_x = deck_start + i * interval;	
			anim2.add(c,{x:[c.x, tar_x]}, true, 0.25,'easeInOutCubic');		
		})	
		
		
		
		
	}
	
}

confirm_dialog = {
	
	p_resolve : 0,
		
	show: function(msg) {
								
		if (objects.confirm_cont.visible === true) {
			sound.play('locked')
			return;			
		}		
		
		sound.play("confirm_dialog");
				
		objects.confirm_msg.text=msg;
		
		anim2.add(objects.confirm_cont,{y:[450,objects.confirm_cont.sy]}, true, 0.6,'easeOutBack');		
				
		return new Promise(function(resolve, reject){					
			confirm_dialog.p_resolve = resolve;	  		  
		});
	},
	
	button_down : function(res) {
		
		if (objects.confirm_cont.ready===false)
			return;
		
		sound.play('click')

		this.close();
		this.p_resolve(res);	
		
	},
	
	close : function() {
		
		anim2.add(objects.confirm_cont,{y:[objects.confirm_cont.sy,450]}, false, 0.4,'easeInBack');		
		
	}

}

anim2 = {
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0, visible:false, ready:true, alpha:0},
		
	slot: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	
	
	
	any_on : function() {
		
		for (let s of this.slot)
			if (s !== null)
				return true
		return false;		
	},
	
	linear: function(x) {
		return x
	},
	
	kill_anim: function(obj) {
		
		for (var i=0;i<this.slot.length;i++)
			if (this.slot[i]!==null)
				if (this.slot[i].obj===obj)
					this.slot[i]=null;		
	},
	
	easeOutBack: function(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeOutElastic: function(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},
	
	easeOutSine: function(x) {
		return Math.sin( x * Math.PI * 0.5);
	},
	
	easeOutCubic: function(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	
	easeInBack: function(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad: function(x) {
		return x * x;
	},
	
	easeOutBounce: function(x) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	},
	
	easeInCubic: function(x) {
		return x * x * x;
	},
	
	ease2back : function(x) {
		return Math.sin(x*Math.PI*2);
	},
	
	easeInOutCubic: function(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	shake : function(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
		
		
	},	
	
	add : function(obj, params, vis_on_end, time, func, anim3_origin) {
				
		//если уже идет анимация данного спрайта то отменяем ее
		anim2.kill_anim(obj);
		/*if (anim3_origin === undefined)
			anim3.kill_anim(obj);*/

		let f=0;
		//ищем свободный слот для анимации
		for (var i = 0; i < this.slot.length; i++) {

			if (this.slot[i] === null) {

				obj.visible = true;
				obj.ready = false;

				//добавляем дельту к параметрам и устанавливаем начальное положение
				for (let key in params) {
					params[key][2]=params[key][1]-params[key][0];					
					obj[key]=params[key][0];
				}
				
				//для возвратных функцие конечное значение равно начальному
				if (func === 'ease2back')
					for (let key in params)
						params[key][1]=params[key][0];					
					
				this.slot[i] = {
					obj: obj,
					params: params,
					vis_on_end: vis_on_end,
					func: this[func].bind(anim2),
					speed: 0.01818 / time,
					progress: 0
				};
				f = 1;
				break;
			}
		}
		
		if (f===0) {
			console.log("Кончились слоты анимации");	
			
			
			//сразу записываем конечные параметры анимации
			for (let key in params)				
				obj[key]=params[key][1];			
			obj.visible=vis_on_end;
			obj.alpha = 1;
			obj.ready=true;
			
			
			return new Promise(function(resolve, reject){					
			  resolve();	  		  
			});	
		}
		else {
			return new Promise(function(resolve, reject){					
			  anim2.slot[i].p_resolve = resolve;	  		  
			});			
			
		}

		
		

	},	
	
	process: function () {
		
		for (var i = 0; i < this.slot.length; i++)
		{
			if (this.slot[i] !== null) {
				
				let s=this.slot[i];
				
				s.progress+=s.speed;		
				
				for (let key in s.params)				
					s.obj[key]=s.params[key][0]+s.params[key][2]*s.func(s.progress);		
				
				//если анимация завершилась то удаляем слот
				if (s.progress>=0.999) {
					for (let key in s.params)				
						s.obj[key]=s.params[key][1];
					
					s.obj.visible=s.vis_on_end;
					if (s.vis_on_end === false)
						s.obj.alpha = 1;
					
					s.obj.ready=true;					
					s.p_resolve('finished');
					this.slot[i] = null;
				}
			}			
		}
		
	},
	
	wait : async function(time) {
		
		await this.add(this.empty_spr,{x:[0, 1]}, false, time,'linear');	
		
	}
}

sound = {
	
	on : 1,
	
	play : function(snd_res) {
		
		if (this.on === 0)
			return;
		
		if (game_res.resources[snd_res]===undefined)
			return;
		
		game_res.resources[snd_res].sound.play();	
		
	},
	
	play_delayed (snd_res, delay) {
		
		if (this.on === 0)
			return;
		
		if (game_res.resources[snd_res]===undefined)
			return;
		
		
		setTimeout(function(){game_res.resources[snd_res].sound.play()}, delay);
			
		
	}
	
	
}

var message =  {
	
	promise_resolve :0,
	
	add : async function(text, timeout) {
		
		if (this.promise_resolve!==0)
			this.promise_resolve("forced");
		
		if (timeout === undefined) timeout = 3000;
		
		//воспроизводим звук
		sound.play('message');

		objects.message_text.text=text;

		await anim2.add(objects.message_cont,{alpha:[0,1]}, true, 0.25,'linear');

		let res = await new Promise((resolve, reject) => {
				message.promise_resolve = resolve;
				setTimeout(resolve, timeout)
			}
		);
		
		if (res === "forced")
			return;

		anim2.add(objects.message_cont,{alpha:[1, 0]}, false, 0.25,'linear');			
	},
	
	clicked : function() {
		
		
		message.promise_resolve();
		
	}

}

big_message = {
	
	p_resolve : 0,
	show_time : 0,
		
	show: async function(t1, feedback_on) {				
				
		this.show_time = Date.now();
		this.feedback_on = feedback_on;
				
		objects.feedback_button.visible = feedback_on;
		objects.big_message_text.text = t1;
		anim2.add(objects.big_message_cont,{y:[600,objects.big_message_cont.sy]}, true, 0.6,'easeOutBack');		
				
		return new Promise(function(resolve, reject){					
			big_message.p_resolve = resolve;	  		  
		});
	
	},
	
	feedback_down : async function () {
		
		if (objects.big_message_cont.ready===false) {
			sound.play('locked');
			return;			
		}


		anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.sy,450]}, false, 0.4,'easeInBack');	
		
		//пишем отзыв и отправляем его		
		let fb = await feedback.show(opp_data.uid);		
		if (fb[0] === 'sent') {
			let fb_id = irnd(0,50);			
			await firebase.database().ref("fb/"+opp_data.uid+"/"+fb_id).set([fb[1], firebase.database.ServerValue.TIMESTAMP, my_data.name]);
		
		}
		
		this.p_resolve("close");
				
	},

	ok_down : function() {
		
		this.close('OK');
		
	},

	close : async function(info) {
		
		if (objects.big_message_cont.ready===false)
			return;
		
		sound.play('click');
		await anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.y,600]}, false, 0.4,'easeInBack');		
		this.p_resolve(info);			
	}

}

mp_game = {
	
	name : 'online',
	start_time : 0,
	disconnect_time : 0,
	me_conf_play : 0,
	opp_conf_play : 0,
	made_moves: 0,
	my_role : "",
	
	send_move :  function(move_data) {
				
		//отправляем сопернику ->
		firebase.database().ref("inbox/"+opp_data.uid).set(move_data);

	},
		
	activate : async function () {
		
		opponent = this;
		
		
		anim2.add(objects.chat_button_cont,{y:[500,objects.chat_button_cont.sy ]}, true, 0.2,'linear');	
		
		//фиксируем врему начала игры для статистики
		this.start_time = Date.now();
				
		//устанавливаем локальный и удаленный статус
		set_state({state : 'p'});
				
	},
		
	send_message : async function() {
		
		let msg_data = await feedback.show();
		
		if (msg_data[0] === 'sent') {			
			firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"CHAT",tm:Date.now(),data:msg_data[1]});	

		} else {			
			message.add('Сообщение не отправлено');
		}
		
	},
		
	process_bet : function() {
		
		
	
		
		
	},
	
	giveup : async function() {
		
		if (this.made_moves < 3) {
			message.add(['Нельзя сдаваться в начале игры','Do not give up so early'][LANG])
			return;
		}
		
		let res = await confirm_dialog.show(['Сдаетесь?','GiveUP?'][LANG])
		
		if (res !== 'ok') return;
		
		//заканчиваем игру поражением
		this.stop('my_giveup')
		
		//отправляем сопернику что мы сдались
		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"GIVEUP",tm:Date.now()});
		
	},
	
	chat : function(data) {
		
		message.add(data, 10000);
		
	},
	
	close : function() {
		
		anim2.add(objects.chat_button_cont,{y:[objects.chat_button_cont.y,500 ]}, false, 0.2,'linear');	

	}
	
}

sp_game = {

	name :'bot',
	on : 0,
	level_id : 0,
	state : 'opp_move',
	center_size : 0,

	activate: async function(role, seed) {
		
		this.on = 1;		

		opponent = this;
		
		opp_data.uid = 'BOT';
		opp_data.rating = 999;
		
		objects.desktop.texture = gres.desktop.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.6,'linear');				
		
		//устанавливаем локальный и удаленный статус
		set_state ({state : 'b'});		

	},
	
	process : function() {
		
				
		
	},
	
	process_bet : async function(action, min_bet, no_rasing) {
		
		
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		console.log(action, min_bet, no_rasing)
				
		const opt_vs = {
			'RAISE':'CALL_RAISE',
			'CHECK':'CHECK_BET',
			'BET':'CALL_RAISE',
			'INIT_BET':'CALL_RAISE',
			'INIT_CHECK':'CHECK_BET',
			'CALL':'CHECK_RAISE'
		};	
				
		//конвертируем ход соперника
		action = opt_vs[action];
		
		if (action === 'CALL_RAISE') {
			
			if (Math.random() > 0.5)
				bet_making.online_waiting_resolve({action:'CALL', value:min_bet})	
			else
				bet_making.online_waiting_resolve({action:'RAISE', value:min_bet + irnd(1,10)})		
			
		}
		
		//это возможность большого блайнда на префлопе
		if (action === 'CHECK_RAISE') {	
			
			if (Math.random() > 0.5)
				bet_making.online_waiting_resolve({action:'CHECK', value:min_bet})	
			else
				bet_making.online_waiting_resolve({action:'RAISE', value:min_bet + irnd(1,10)})		
			
		}
		
		if (action === 'CHECK_BET') {
			
			bet_making.online_waiting_resolve({action:'CHECK', value:min_bet})	
			
		}
				
	},
	
	send_move : async function(move_data) {
			


	},

	reset_timer : function() {
		
		
	},
		
	stop : async function(result) {
						
		this.on = 0;
		let res_array = [
			['my_win',WIN , ['Вы выиграли!\n','You win!\nYou have captured more territory!']],		
			['opp_win',LOSE, ['Вы проиграли!\n','You lose!\nThe opponent has captured more territory']],
			['my_stop',DRAW, ['Вы отменили игру!\n','You canceled game!']],
			['draw' ,DRAW, ['Ничья','Draw!']]
		];
		
		let result_row = res_array.find( p => p[0] === result);
		let result_str = result_row[0];		
		let result_number = result_row[1];
		let result_info = result_row[2][LANG];		

	
		//воспроизводим звук
		if (result_number === DRAW || result_number === LOSE || result_number === NOSYNC )
			sound.play('lose');
		else
			sound.play('win');
		
		show_ad();
		set_state({state : 'o'});	
		this.close();

	},
	
	exit_button_down : async function() {
		
		
		//table.init('master',irnd(0,9999));
		//return;
		
		if (anim2.any_on()===true)
			return;
		
		if (objects.big_message_cont.visible === true)
			return;
		
		let res = await confirm_dialog.show(['Закончить игру?','Stop game?'][LANG])
		if (res !== 'ok') return;
		show_ad();
		set_state({state : 'o'});
		this.stop('my_stop');

	},
		
	close : async function() {
		
	
		
	},
	
	switch_close : function() {
		
		
	}

}

hand_check = {
	
	
	comb_kickers :{'HIGH_CARD':5, 'PAIR':4,'TWO_PAIRS':3,'SET':3,'STRAIGHT':1,'FLUSH':5,'FULL_HOUSE':2,'KARE':2,'STRAIGHT_FLUSH':1,'ROYAL_FLUSH':1},
	comb_value :{'HIGH_CARD':0, 'PAIR':1,'TWO_PAIRS':2,'SET':3,'STRAIGHT':4,'FLUSH':5,'FULL_HOUSE':6,'KARE':7,'STRAIGHT_FLUSH':8,'ROYAL_FLUSH':9},
	compare : function(r1,r2) {
		
		if (r1 > r2) return 0;
		if (r1 < r2) return 1;
		return -1;	
		
	},
	
	check_winner : function(my_res, opp_res) {
				
		if (my_res.name === opp_res.name) {		
			let data = [];
			let num_of_kickers = this.comb_kickers[my_res.name];

			let my_kickers = '';
			let opp_kickers = '';
			
			for (let k = 0 ; k < num_of_kickers;k++) {
				let comp = this.compare(my_res.data[k].value, opp_res.data[k].value)
				my_kickers = my_kickers + value_num_to_txt[my_res.data[k].value] + ' ';
				opp_kickers = opp_kickers + value_num_to_txt[opp_res.data[k].value] + ' ';
				if (comp!== -1) return [comp,my_kickers,opp_kickers];					
			}
			return [-1,my_kickers,opp_kickers];
		} else {
			
			return [this.compare(this.comb_value[my_res.name],this.comb_value[opp_res.name]),'',''];
			
		}
	},

	check : function(cards) {
		
		
		let res;		
		
		res = this.check_flush_royal(cards);
		if (res.check === 1) return res;
		res = this.check_street_flush(cards)
		if (res.check === 1) return res;
		res = this.check_kare(cards);
		if (res.check === 1) return res;
		res = this.check_full_house(cards);
		if (res.check === 1) return res;
		res = this.check_flush(cards);
		if (res.check === 1) return res;
		res = this.check_street(cards);
		if (res.check === 1) return res;
		res = this.check_tripple(cards);
		if (res.check === 1) return res;
		res = this.check_two_pair(cards);
		if (res.check === 1) return res;
		res = this.check_pair(cards);
		if (res.check === 1) return res;
		res = this.check_high_card(cards);
		if (res.check === 1) return res;
		
	},
		
	check_flush_royal : function(cards) {

		let hand = '';
		for (let card of cards) {			
			let s = card.value_txt + card.suit_txt;
			hand += s;
		}		
		
		if (['10h','Jh','Qh','Kh','Ah'].every(card => hand.includes(card)))
			return {check:1, name:'ROYAL FLUSH', data:[{value:0}]}; 
		if (['10d','Jd','Qd','Kd','Ad'].every(card => hand.includes(card)))
			return {check:1, name:'ROYAL FLUSH', data:[{value:0}]}; 
		if (['10s','Js','Qs','Ks','As'].every(card => hand.includes(card)))
			return {check:1, name:'ROYAL FLUSH', data:[{value:0}]}; 
		if (['10c','Jc','Qc','Kc','Ac'].every(card => hand.includes(card)))
			return {check:1, name:'ROYAL_FLUSH', data:[{value:0}]}; 

		return {check:0};
		
	},
	
	check_street_flush : function(cards) {
		
		let hand = '';
		for (let card of cards) {			
			let s = card.value_txt + card.suit_txt;			
			hand += s;
		}	
		//console.log(hand);
		
		for (let s = 0 ; s < 4; s++) {				
			for (let d = 0 ; d < 8 ; d ++) {
				let tar_hand = [];
				for (let i = 9 ; i < 14; i++)
					tar_hand.push(value_num_to_txt[i - d] + suit_num_to_txt[s]);
				
				if (tar_hand.every(card => hand.includes(card)))
					return {check:1, name:'STRAIGHT_FLUSH', data: [{value : 13 - d}]};
			}
		}
		
		return {check:0};

	},
	
	check_kare : function(cards) {		
		
		//считаем сколько значений но сначала самые большие
		let counter = new Array(15).fill().map(() => { return {count : 0, rang : 0, value :0 }});	
				
		//заполняем данными из карт
		for (let card of cards)	{
			counter[card.value_num].count++;
			counter[card.value_num].rang=card.value_num;
			counter[card.value_num].value = card.value_num;
		}
		
		//проверяем есть ли 2 пары
		let found = 0;
		for (let elem of counter)	{			
			if (elem.count === 4) {				
				found = 1;
				elem.rang = elem.value * 100;
			}
		}
		
		//если не нашли две пары
		if (found === 0)	return {check:0};
				
		//сортируем
		counter = counter.sort(function(a, b) {return b.rang - a.rang});
						
		return {check:1, name:'KARE', data : [counter[0],counter[1]] };	
	},
		
	check_full_house : function(cards) {
		
		//считаем сколько значений но сначала самые большие
		let counter = [0,0,0,0,0,0,0,0,0,0,0,0,0];		
		for (let card of cards)	counter[14 - card.value_num] ++;
		
		//ищем самые большие позиции
		let pos_of_3 = counter.findIndex(v=>v===3);
		let pos_of_2 = counter.findIndex(v=>v===2);
		
		if (pos_of_3 !== -1 && pos_of_2 !== -1)
			return {check:1, name : 'FULL_HOUSE', data : [{value : 14 - pos_of_3}, { value : 14 - pos_of_2}]};				
		return {check:0};		
		
	},
	
	check_flush : function(cards) {
		
		let counter = {};		
		for (let card of cards) {			
			if (counter[card.suit_txt] === undefined)
				counter[card.suit_txt] = [{value : card.value_num}];
			else
				counter[card.suit_txt].push({value : card.value_num});
		}	
		
		for (let card of  Object.keys(counter))
			if (counter[card].length >= 5)
				return {check:1, name:'FLUSH',  data : counter[card].sort(function(a, b) {return b.value - a.value })};
			
		return {check:0};		
		
	},
	
	check_street : function(cards) {
		
		let hand = [];
		for (let card of cards)		
			hand.push(card.value_num);
	
			
		for (let d = 0 ; d < 9 ; d ++) {	

			let tar_hand = [];
			for (let i = 10 ; i < 15; i++)
				tar_hand.push(i - d);
			
			if (tar_hand.every(card => hand.includes(card)))
				return {check: 1, name:'STRAIGHT', data : [{value : 14 - d}]};	
		}		
		return {check:0};			
	},
	
	check_tripple : function(cards) {
		
		//считаем сколько значений но сначала самые большие
		let counter = new Array(15).fill().map(() => { return {count : 0, rang : 0, value : 0}});	
				
		//заполняем данными из карт
		for (let card of cards)	{
			counter[card.value_num].count++;
			counter[card.value_num].rang=card.value_num;
			counter[card.value_num].value = card.value_num;
		}
		
		//проверяем есть ли триппл
		let pos_of_3 = counter.findIndex(e => e.count === 3);
		
		//если не нашли триппл
		if (pos_of_3 === -1)	return {check:0};
		
		//трипплу устанаваем большое значение
		counter[pos_of_3].rang = 999;
		
		//сортируем
		counter = counter.sort(function(a, b) {return b.rang - a.rang});
						
		return {check:1, name : 'SET', data : [counter[0],counter[1],counter[2]] };	
	},
	
	check_two_pair : function(cards) {
		
		//считаем сколько значений но сначала самые большие
		let counter = new Array(15).fill().map(() => { return {count : 0, rang : 0, value :0 }});	
				
		//заполняем данными из карт
		for (let card of cards)	{
			counter[card.value_num].count++;
			counter[card.value_num].rang = card.value_num;
			counter[card.value_num].value = card.value_num;
		}
		
		//проверяем есть ли 2 пары
		let found_2 = 0;
		for (let elem of counter)	{			
			if (elem.count === 2) {
				
				found_2++;
				elem.rang = elem.value * 100;
			}
		}
		
		//если не нашли две пары
		if (found_2 < 2)	return {check:0};
				
		//сортируем
		counter = counter.sort(function(a, b) {return b.rang - a.rang});
						
		return {check:1, name : 'TWO_PAIRS',data : [counter[0],counter[1],counter[2]] };	
		
	},
	
	check_pair : function(cards) {
		
		//считаем сколько значений но сначала самые большие
		let counter = new Array(15).fill().map(() => { return {count : 0, rang : 0, value :0 }});	
				
		//заполняем данными из карт
		for (let card of cards)	{
			counter[card.value_num].count++;
			counter[card.value_num].rang=card.value_num;
			counter[card.value_num].value = card.value_num;
		}
		
		//проверяем есть ли 2 пары
		let found = 0;
		for (let elem of counter)	{			
			if (elem.count === 2) {
				
				found = 1;
				elem.rang = elem.value * 100;
			}
		}
		
		//если не нашли две пары
		if (found === 0)	return {check:0};
				
		//сортируем
		counter = counter.sort(function(a, b) {return b.rang - a.rang});
						
		return {check:1, name : 'PAIR',data : [counter[0],counter[1],counter[2],counter[3]] };	
		
	},
	
	check_high_card : function(cards) {
		
		//считаем сколько значений но сначала самые большие
		let counter = new Array(15).fill().map(() => { return {count : 0, rang : 0, value :0 }});	
				
		//заполняем данными из карт
		for (let card of cards)	{
			counter[card.value_num].count++;
			counter[card.value_num].rang = card.value_num;
			counter[card.value_num].value = card.value_num;
		}
		
				
		//сортируем
		counter = counter.sort(function(a, b) {return b.rang - a.rang});
						
		return {check:1, name : 'HIGH_CARD',data : [counter[0],counter[1],counter[2],counter[3],counter[4]] };
		
	}

	
}

round_finish_dialog = {
	
	end_flag : 0,
	p_resole : null,
	
	show : function () {
				
				
		let res_array = [
			['my_win',WIN , 'Вы выиграли!\nВаша комбинация лучще!'],		
			['opp_win',LOSE, 'Вы проиграли!\nКомбинация соперника лучше!'],
			['my_fold',DRAW, 'Вы скинули карты!'],
			['opp_fold',DRAW, 'Соперник скинул карты!'],
			['draw' ,DRAW, 'Ничья!\nКомбинации одинаковой силы!']
		];
		
		let result_row = res_array.find( p => p[0] === table.round_result);
		let result_str = result_row[0];		
		let result_number = result_row[1];
		objects.rfd_title.text = result_row[2];	
		

		//воспроизводим звук
		if (result_number === DRAW || result_number === LOSE || result_number === NOSYNC )
			sound.play('lose');
		else
			sound.play('win');
						
		anim2.add(objects.rfd_cont,{y:[600,objects.rfd_cont.sy]}, true, 0.6,'easeOutBack');	
		
		//проверка что есть деньги
		if (my_data.rating >= BIG_BLIND) {
			
			this.wait_resume_game();			
			
		} else {
			
			objects.rfd_ok_title.text = 'Выйти';
			this.end_flag = 1;
			
		}

		
		//ожидаем выбор
		return new Promise(function(res, rej){			
			round_finish_dialog.p_resole = res;			
		})
		
		
		
	},
	
	wait_resume_game : async function() {
		
		this.end_flag = 0;
		
		const WAITING_TIME_SEC = 15;
		
		
		for (let i = WAITING_TIME_SEC ; i > 0 ; i--) {	
		
			if (this.visible === false) return;
			
			objects.rfd_ok_title.text = 'Дальше ' + i + 'сек';		
			await new Promise(resolve => setTimeout(resolve, 1000));				
		}
		
		objects.rfd_ok_title.text = 'Выйти';
		this.end_flag = 1;
		
	},
	
	ok_down : function() {
		
		if (this.end_flag === 1) {
			
			//время ожидания прошло завершаем игру
			this.p_resole('exit');
			
		} else {
			
			//отправляем сообщение что готовы продолжать
			firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"CN",tm:Date.now()});
			this.p_resole('ok');
			
		}
		sound.play('click');
		this.close();

		
	},
	
	exit_down : function() {
		
		sound.play('click');
		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"NO_RESUME",tm:Date.now()});
		this.p_resole('exit');
		this.close();
	},
	
	close : function() {
		
		anim2.add(objects.rfd_cont,{y:[objects.rfd_cont.y, 600]}, false, 0.5,'easeInBack');	
		
		
	}
	
	
}

wait_confirm_from_opponent = {
	
	opp_confirm_flag : 0,
	
	start : async function (zero_round) {
				
		//это если самый первый раунд
		if (zero_round === 0 || opp_data.uid === 'BOT') return true;
				
		const WAITING_TIME_SEC = 20;
		objects.wait_confirm_title.visible = true;
		for (let i = WAITING_TIME_SEC ; i > 0; i--) {
						
			objects.wait_confirm_title.text = 'Ждем соперника...' + i;
			//провряем получение поддтверждения о продолжении игры
			if (this.opp_confirm_flag === 1) {
				this.opp_confirm_flag = 0;
				objects.wait_confirm_title.visible = false;
				return true;			
			}
			
			//провряем получение отказа о продолжении игры
			if (this.opp_confirm_flag === 2) {
				this.opp_confirm_flag = 0;
				objects.wait_confirm_title.visible = false;
				return false	
			}
			
			await new Promise(resolve => setTimeout(resolve, 1000));
			
		}	
		
		objects.wait_confirm_title.visible = false;
		return false;
	}
	
}

timer = {
	
	id : 0,
	time_left : 0,
	
	start : function(player, t) {
		
		
		this.time_left = 30 || t;
		this.id = setTimeout(timer.check.bind(timer),1000);
		objects.timer_cont.visible = true;
		objects.timer_text.text = this.time_left;
		
		if (player === ME)
			objects.timer_cont.y = 305;
		else
			objects.timer_cont.y = 145;
		
		anim2.add(objects.timer_cont,{scale_x:[0, 1]}, true, 0.2,'linear');	
				
	},
	
	stop : function() {
			
		anim2.add(objects.timer_cont,{scale_x:[1, 0]}, false, 0.2,'linear');	
		clearTimeout(this.id);
		
	},
	
	check : function() {
		
		this.time_left--;
		
		if (turn === ME && this.time_left === 0)
			bet_dialog.no_time();
		
		if (turn === OPP && this.time_left === -5)
			bet_making.no_time();
		
		objects.timer_text.text = this.time_left;
		this.id = setTimeout(timer.check.bind(timer),1000);		
		
	},
	
	reset : function() {
		
				
		
	}
	
}

bet_dialog = {
	
	p_resolve : null,
	bet_amount : 1,
	no_rasing : false,
	min_max_vals : [0,0],
	min_max_opts : ['',''],
	
	
	show : async function (opp_action, min_bet, no_rasing) {
	
		sound.play('dialog');	
		
		//указатель о невозможности рейзинга
		this.no_rasing = no_rasing;

		const opt_vs = {
			'RAISE':'CALL_RAISE',
			'CHECK':'CHECK_BET',
			'BET':'CALL_RAISE',
			'INIT_BET':'CALL_RAISE',
			'INIT_CHECK':'CHECK_BET',
			'CALL':'CHECK_RAISE'
		};	
				
		//конвертируем ход соперника
		let action = opt_vs[opp_action];
		
		this.bet_amount = min_bet;										
								
		//можно колировать или поднять (мин-макс)	
		if (opp_action === 'INIT_BET')
			objects.bet_title0.text = 'Сделайте первую ставку (CALL) размером большого блайнда или больше (RAISE)';
		if (opp_action === 'RAISE')
			objects.bet_title0.text = 'Соперник поднял ставку (RAISE), нужно ответить (CALL), поднять (RAISE) или сдаться (FOLD)';
		if (opp_action === 'BET')
			objects.bet_title0.text = 'Соперник сделал ставку (BET), нужно ответить (CALL), поднять (RAISE) или сдаться (FOLD)';
		if (opp_action === 'CHECK')
			objects.bet_title0.text = 'Соперник не сделал ставку (CHECK), можно тоже пропустить (CHECK) или сделать ее (BET)';					
		if (opp_action === 'INIT_CHECK')
			objects.bet_title0.text = 'Делайте ставку (BET), но можно и пропустить (CHECK)';	
		if (opp_action === 'CALL')
			objects.bet_title0.text = 'Соперник сделал ставку, можно пропустить (CHECK), поднять (RAISE) или сдаться (FOLD)';
		if (no_rasing === true)
			objects.bet_title0.text = 'Соперник поднял ставку (RAISE), можно только ответить (CALL), поднять нельзя';	
		
		
		if (action === 'CALL_RAISE') {
			
			if (min_bet > my_data.rating) {
				this.min_max_vals = [my_data.rating, my_data.rating];			
				this.min_max_opts = ['CALL', 'CALL'];
			} else {
				this.min_max_vals = [min_bet, Math.min(99,my_data.rating)];			
				this.min_max_opts = ['CALL', 'RAISE'];				
			}	
			
		}
		
		//это возможность большого блайнда на префлопе
		if (action === 'CHECK_RAISE') {	
			
			if (my_data.rating === 0) {
				this.min_max_vals = [my_data.rating, my_data.rating];			
				this.min_max_opts = ['CHECK', 'CHECK'];
			} else {
				this.min_max_vals = [min_bet, Math.min(99,my_data.rating)];			
				this.min_max_opts = ['CHECK', 'RAISE'];				
			}			
			
		}
		
		if (action === 'CHECK_BET') {
			
			if (my_data.rating === 0) {
				this.min_max_vals = [my_data.rating, my_data.rating];			
				this.min_max_opts = ['CHECK', 'CHECK'];
			} else {
				this.min_max_vals = [0, Math.min(99,my_data.rating)];			
				this.min_max_opts = ['CHECK', 'BET'];				
			}
			
		}
		
		this.bet_amount = this.min_max_vals[0];
		objects.call_title.text = this.min_max_opts[0];
		objects.bet_title1.text = this.min_max_vals[0];
		
		
		anim2.add(objects.bet_dialog_cont,{y:[600,objects.bet_dialog_cont.sy]}, true, 0.6,'easeOutBack');	
	
		return new Promise(function(resolve, reject){
			bet_dialog.p_resolve = resolve;			
		})		
		
	},
	
	ok_down : function () {
		
		sound.play('click');	
		this.p_resolve({action:objects.call_title.text, value:this.bet_amount})		
		this.close();
	},
	
	no_time : function () {
		
		this.p_resolve({action:'NOTIME', value:0})		
		this.close();
	},
	
	close : function() {
		
		anim2.add(objects.bet_dialog_cont,{y:[objects.bet_dialog_cont.y, 600]}, false, 0.6,'easeInBack');	
		
	},

	fold_down : function () {
		
		sound.play('click');	
		this.p_resolve({action:'FOLD', value:0})				
		this.close();
	},
	
	minus : function () {	
	
		this.bet_amount--;		
			
		//если ниже биг блайнда то сразу в ноль
		if (BIG_BLIND > this.bet_amount) this.bet_amount = 0;
		
		if (this.bet_amount < this.min_max_vals[0]) {
			
			this.bet_amount = this.min_max_vals[0]			
			sound.play('locked');			
		} else {
			
			sound.play('plus_minus_bet');			
		}

			
		objects.bet_title1.text = this.bet_amount;
		objects.call_title.text = this.min_max_opts[0];				

		
	},
	
	plus : function () {	

		if (this.no_rasing) return;
	
		this.bet_amount++;
		
		//если увеличили 0 то сразу на биг блайнд
		if (this.bet_amount === 1) this.bet_amount = Math.min(BIG_BLIND,my_data.rating);
		
		if (this.bet_amount > this.min_max_vals[1]) {			
			this.bet_amount = this.min_max_vals[1]		
			sound.play('locked');			
		} else {
			sound.play('plus_minus_bet');
		}

		
		objects.call_title.text = this.min_max_opts[1];
		objects.bet_title1.text = this.bet_amount;
		

			
	},
			
}

bet_making = {
				
	online_waiting_resolve : '',
	
	start : async function( player , action, min_bet, no_rasing) {		
	
		//если игра завершена то пропукаем все
		if (table.folded !== -1) return;
		
		//обновляем таймер
		timer.start(player);	

		//запоминаем чья очередь
		turn = player;
		
		if (player === ME) {
						
			bet_data = await bet_dialog.show(action, min_bet, no_rasing);	

			//отправляем сопернику
			opponent.send_move({sender:my_data.uid, message:'MOVE',data : bet_data, tm : Date.now()});
		
			//отправляем на стол
			table.process_bet(bet_data, player);
			
			//пока выключаем таймер до следующего ожидания
			timer.stop();
		
			return bet_data;
		}
		
		if (player === OPP) {		
	
			opponent.process_bet(action, min_bet, no_rasing);
			
			objects.opp_waiting_note.visible = true;
			some_process.opp_bet_making = function() {				
				objects.opp_waiting_note.alpha = Math.abs(Math.sin(game_tick));				
			}			
			
			bet_data = await new Promise(function(resolve, reject){			
				bet_making.online_waiting_resolve = resolve;			
			})
			
			objects.opp_waiting_note.visible = false;
			some_process.opp_bet_making = function() {}
			
			//пока выключаем таймер до следующего ожидания
			timer.stop();	
			
			//отправляем на стол
			table.process_bet(bet_data, player);
			
			return bet_data;
		}		
		
	},
	
	no_time() {
		
		this.online_waiting_resolve('NOTIME');		

	},
	
	recv_bet_online (bet) {
				
		//завершаем ожидание
		this.online_waiting_resolve(bet)			
		
	}	
	
}

game = {	

	start_player : 0,
	
	activate : async function(start_player, opponent, seed){
		
		//активируем все что связано с онлайн или ботом
		opponent.activate();
		
		//показыаем карточки
		anim2.add(objects.my_card_cont,{x:[-100,objects.my_card_cont.sx]}, true, 0.6,'easeOutBack');	
		anim2.add(objects.opp_card_cont,{x:[-100,objects.opp_card_cont.sx]}, true, 0.6,'easeOutBack');	
				
		//устанавливаем кто начальный игрок 
		this.start_player = start_player;				
			
		//цикл который длиться пока игрокам не надоест играть
		let info = await this.loop(start_player, seed);		
		
		//показываем финальное сообщение с возможностью отзыва
		await big_message.show(info, 1);
		
		main_menu.activate();
		
		//убираем все элементы игры		
		this.close();		
		
	},
		
	loop : async function(start_player, seed) {
		
		let num_of_rounds = 0;
		
		for (let i = 0 ; i < 1000 ; i++ ) {
						
						
			//проверяем есть ли у соперника фишки
			if (opp_data.rating < BIG_BLIND)
				return 'У соперника недостаточно фишек чтобы продолжить игру';
			
			if (await wait_confirm_from_opponent.start(i) === false)		
				return 'Похоже соперник не захотел продолжать игру';
				
			
			//инициируем стол и блайнды
			await table.init(start_player, seed);
			
							
			let round_res = await this.process_round(start_player);
			
			if (round_res === 'FOLD' + ME) 
				table.folded = ME;
			
			if (round_res === 'FOLD' + OPP) 
				table.folded = OPP;
			
			if (round_res === 'NOTIME' + ME) 
				return 'Вы не сделали ход в установленное время. Ваши ставки достались сопернику.';
			
			if (round_res === 'NOTIME' + OPP) 
				return 'Соперник не сделали ход в установленное время. Его ставки достались вам.';


			//если раунд закончился нормально или фолдом то проверяем дальше
			await table.opp_cards[0].open();
			await table.opp_cards[1].open();
					
			//определяем и заносим показатели о результате игры
			table.calculate_winner();
			
			//показыаем результаты
			let m_res = await round_finish_dialog.show()
			if (m_res === 'exit') return 'Игра закончена';
			
			table.close();
			
			start_player = 1 - start_player;
			seed++;
			
		}
	
			
	},
	
	process_round : async function(start_player) {		
	
				
			//***************PRE-FLOP*********************				
			let check = hand_check.check(table.my_cards);
			objects.my_result.text = check.name;
			
			let opt = {action:'INIT_BET', value : BIG_BLIND};
			for(let i = 0 ; i < 1000 ; i ++) {
				
				opt = await bet_making.start(start_player, opt.action, opt.value, i > 3);	
				if (opt.action === 'FOLD') return 'FOLD'+start_player;	
				if (opt.action === 'NOTIME') return 'NOTIME'+start_player;
				if (opt.action === 'CALL' && i > 0) break	
				
				opt = await bet_making.start(1 - start_player, opt.action, opt.value, i > 3);				
				if (opt.action === 'FOLD') return 'FOLD'+(1 - start_player);	
				if (opt.action === 'NOTIME') return 'NOTIME'+(1 - start_player);	
				if (opt.action === 'CALL' || opt.action === 'CHECK') break;		
			}	


			//показываем 3 карты
			await table.open_next_card();
			await table.open_next_card();	
		
			//3 улицы
			for (let street of ['FLOP', 'TURN', 'RIVER']) {
				
				
				await table.open_next_card();	
				if (street === 'FLOP')
					cards_to_check =[...table.my_cards,table.cen_cards[0],table.cen_cards[1],table.cen_cards[2]]
				if (street === 'TURN')
					cards_to_check = [...table.my_cards,table.cen_cards[0],table.cen_cards[1],table.cen_cards[2],table.cen_cards[3]];
				if (street === 'RIVER')
					cards_to_check = [...table.my_cards,...table.cen_cards];
				
				console.log('----------------')
				for(let c of cards_to_check)
				console.log(c.value_num);
				
				let check = hand_check.check(cards_to_check);
				objects.my_result.text = check.name;
				
				opt = {action:'INIT_CHECK', value : 0};
				table.row[0]++;
				table.row[1]++;			
				for(let i = 0 ; i < 1000 ; i ++) {
					
					opt = await bet_making.start(start_player, opt.action, opt.value, i > 3);		
					if (opt.action === 'FOLD') return 'FOLD'+start_player;	
					if (opt.action === 'NOTIME') return 'NOTIME'+start_player;
					if (opt.action === 'CALL') break;
					
					opt = await bet_making.start(1 - start_player, opt.action, opt.value, i > 3);		
					if (opt.action === 'FOLD') return 'FOLD'+(1 - start_player);	
					if (opt.action === 'NOTIME') return 'NOTIME'+(1 - start_player);
					if (opt.action === 'CALL' || opt.action === 'CHECK') break;
					
				}					
				
			}
			
			//раунд закончился нормально
			return 'OK';
					
					
		
	},
	
	close : function() {
		
		//показыаем карточки
		anim2.add(objects.my_card_cont,{x:[objects.my_card_cont.sx,-100]}, false, 0.4,'easeInBack');	
		anim2.add(objects.opp_card_cont,{x:[objects.opp_card_cont.sx,-100]}, false, 0.4,'easeInBack');	
		
		objects.timer_cont.visible = false;
		
		opponent.close();
		
		//show_ad();
		
		set_state({state : 'o'});	
		
		//убираем элементы стола
		table.close();
		
	}
	
}

table = {
	
	active_call : 0,
	folded : -1,
	card_to_open : 0,
	my_cards : [],
	opp_cards : [],
	cen_cards : [],
	bets_info : [],
	total_pot : 0,
	row : [0,0],
	round_result : '',
	
	init : async function(start_player, seed) {		
	
	
		//формируем и тусуем колоду карт
		big_deck.init(seed);
		
		
		//обнуляем данные о ставках и устанаваем начальную ставку
		this.bets_info.forEach(b => b.forEach(i=>i.text = ''));
		this.bets_info[1][0].text = 2 - start_player;
		this.bets_info[0][0].text = 1 + start_player;
			
			
		//выдергиваем из большой колоды 4 карты (2 моих и 2 соперника)
		if (start_player === ME) {

			this.my_cards[0].set(big_deck.cards.pop());
			this.my_cards[1].set(big_deck.cards.pop());
			this.opp_cards[0].set(big_deck.cards.pop());
			this.opp_cards[1].set(big_deck.cards.pop());
			
		} else {
			
			this.opp_cards[0].set(big_deck.cards.pop());
			this.opp_cards[1].set(big_deck.cards.pop());			
			this.my_cards[0].set(big_deck.cards.pop());
			this.my_cards[1].set(big_deck.cards.pop());
			
		}		
		
		//активный колл
		this.active_call = 2;
		
		//центральные карты
		for (let c=0;c<5;c++)
			this.cen_cards[c].set(big_deck.cards.pop());

		//это номер карты которую следующей надо открыть
		this.card_to_open=0;
		
		//делаем блайнды
		this.update_balance(start_player, -1);
		this.update_balance(1 - start_player, -2);		
		
		//показываем результаты игры но они пока не видны
		objects.my_result.visible = objects.opp_result.visible = true;	
		objects.my_result.text = objects.opp_result.text = '';
		
		//отображаем начальный банк
		this.total_pot = 2;		
		objects.total_pot.text = this.total_pot;

		//победителя пока не существует
		this.winner = null;
		
		//пока никто не скинул карты
		this.folded = -1;
		
		//номер текущей улицы
		this.row = [1,1];

		//отображаем контейнер ставок
		objects.bets_cont.visible = true;
		
		//центральные карты и карты соперника показываем рубашкой	
		[...this.cen_cards,...this.opp_cards].forEach(card => card.set_shirt());
		
		//раскидываем карты всем
		for (let card of [...this.my_cards,...this.opp_cards,...this.cen_cards]) {		
			sound.play('card');
			await anim2.add(card,{angle:[irnd(-45,45),0],x:[-200, card.sx],y:[225, card.sy]}, true, 0.2,'linear');	
		}

		
	},
	
	open_next_card : async function() {		
	
		//если карты сложены то не открываем
		if (this.folded !== -1) return;
		
		await this.cen_cards[this.card_to_open].open();
		
		this.card_to_open++;		
		
	},	
	
	process_bet : function(bet_data, player) {		
		
		//отображаем ставку в таблице
		let cur_bet = this.bets_info[player][this.row[player]].text*1;
		this.bets_info[player][this.row[player]].text = cur_bet + bet_data.value;
							
		//уменьшаем количество фищек у игрока
		this.update_balance(player, -bet_data.value);
							
		//увеличиваем банк
		this.total_pot += bet_data.value;		
		objects.total_pot.text = this.total_pot;
		
		//устанаваем состояние если кто-то сбросил карты
		if (bet_data.action === 'FOLD')
			this.folded = 1;
			
		
	},
	
	update_balance : function(player, amount) {
		
		if (player === ME) {
			
			my_data.rating += amount;			
			objects.my_card_rating.text = my_data.rating;
			
		} else {
			
			opp_data.rating += amount;			
			objects.opp_card_rating.text = opp_data.rating;
			
		}
		
	},
	
	calculate_winner : function() {
		
		if (this.folded === ME) {			
			opp_data.rating += this.total_pot;
			objects.opp_card_rating.text=opp_data.rating;	
			this.round_result = 'my_fold';
			return;
		}
						
		if (this.folded === OPP) {			
			my_data.rating += this.total_pot;
			objects.my_card_rating.text=my_data.rating;	
			this.round_result = 'opp_fold';
			return;
		}		
		
		let opp_res = hand_check.check([...this.opp_cards,...this.cen_cards]);
		let my_res = hand_check.check([...this.my_cards,...this.cen_cards]);
		
		console.log(opp_res.data);
		console.log(my_res.data);
		
		let opp_winner ='';
		let my_winner = '';
		
		let winner = hand_check.check_winner(my_res, opp_res);
		
		if (winner[0] === 0) {
			my_winner =  ' (победитель)';			
			this.round_result = 'my_win';
			my_data.rating += this.total_pot;
			objects.my_card_rating.text=my_data.rating;
		}
		
		if (winner[0] === 1) {
			opp_winner =  ' (победитель)';			
			this.round_result = 'opp_win';
			opp_data.rating += this.total_pot;			
			objects.opp_card_rating.text=opp_data.rating;
			
		}
		
		if (winner[0] === -1) {
			
			my_data.rating += ~~(this.total_pot*0.5);
			opp_data.rating += ~~(this.total_pot*0.5);
			this.round_result = 'draw';
			objects.my_card_rating.text=my_data.rating;
			objects.opp_card_rating.text=opp_data.rating;
		}
		

			

			
		objects.my_result.visible = true;
		objects.opp_result.visible = true;
		
		objects.my_result.text = my_res.name + my_winner+'\nкикеры: '+winner[1];				
		objects.opp_result.text = opp_res.name + opp_winner+'\nкикеры: '+winner[2] ;
		
		
	},
	
	close : function() {
		
		//показываем карты соперника
		this.opp_cards.forEach(card => {card.visible = false})
				
		//показываем мои карты
		this.my_cards.forEach(card => {card.visible = false})
		
		//убираем центральные карты
		this.cen_cards.forEach(card => card.visible = false)
		
		//отображаем контейнер ставок
		objects.bets_cont.visible = false;
		
		//показываем результаты игры но они пока не видны
		objects.my_result.visible = objects.opp_result.visible = false;	
	}
	
}

make_text = function (obj, text, max_width) {

	let sum_v=0;
	let f_size=obj.fontSize;

	for (let i=0;i<text.length;i++) {

		let code_id=text.charCodeAt(i);
		let char_obj=game_res.resources.m2_font.bitmapFont.chars[code_id];
		if (char_obj===undefined) {
			char_obj=game_res.resources.m2_font.bitmapFont.chars[83];
			text = text.substring(0, i) + 'S' + text.substring(i + 1);
		}

		sum_v+=char_obj.xAdvance*f_size/64;
		if (sum_v>max_width) {
			obj.text =  text.substring(0,i-1);
			return;
		}
	}

	obj.text =  text;
}

social_dialog = {
	

	invite_down : function() {
				
		gres.click.sound.play();
		vkBridge.send('VKWebAppShowInviteBox');		
		
	},
	
	share_down: function() {
		
		
		gres.click.sound.play();
		vkBridge.send('VKWebAppShowWallPostBox', {"message": `Помог пчелке защитить улей, теперь мой рейтинг ${my_data.rating}. Сможешь победить меня?`,
		"attachments": "https://vk.com/app8220670"});

	}
	
}

show_ad = async function(){
		
	if (game_platform==="YANDEX") {			
		try {
			await new Promise((resolve, reject) => {			
				window.ysdk.adv.showFullscreenAdv({  callbacks: {onClose: function() {resolve()}, onError: function() {resolve()}}});			
			});				
			
		} catch (e) {
			
			console.error(e);
		}
	}
	
	if (game_platform==="VK") {
				 
		try {
			await vkBridge.send("VKWebAppShowNativeAds", {ad_format:"interstitial"});			
		} catch (e) {			
			console.error(e);
		}		
	}		

	if (game_platform==="CRAZYGAMES") {
				 
		try {
			const crazysdk = window.CrazyGames.CrazySDK.getInstance();
			crazysdk.init();
			crazysdk.requestAd('midgame');		
		} catch (e) {			
			console.error(e);
		}
	}		

}

confirm_dialog = {
	
	p_resolve : 0,
		
	show: function(msg) {
								
		if (objects.confirm_cont.visible === true) {
			sound.play('locked')
			return;			
		}		
		
		sound.play("confirm_dialog");
				
		objects.confirm_msg.text=msg;
		
		anim2.add(objects.confirm_cont,{y:[450,objects.confirm_cont.sy]}, true, 0.6,'easeOutBack');		
				
		return new Promise(function(resolve, reject){					
			confirm_dialog.p_resolve = resolve;	  		  
		});
	},
	
	button_down : function(res) {
		
		if (objects.confirm_cont.ready===false)
			return;
		
		sound.play('click')

		this.close();
		this.p_resolve(res);	
		
	},
	
	close : function() {
		
		anim2.add(objects.confirm_cont,{y:[objects.confirm_cont.sy,450]}, false, 0.4,'easeInBack');		
		
	}

}

keep_alive= function() {
	
	if (h_state === 1) {		
		
		//убираем из списка если прошло время с момента перехода в скрытое состояние		
		let cur_ts = Date.now();	
		let sec_passed = (cur_ts - hidden_state_start)/1000;		
		if ( sec_passed > 100 )	firebase.database().ref(room_name+"/"+my_data.uid).remove();
		return;		
	}


	firebase.database().ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);
	firebase.database().ref("inbox/"+my_data.uid).onDisconnect().remove();
	firebase.database().ref(room_name+"/"+my_data.uid).onDisconnect().remove();

	set_state({});
}

process_new_message=function(msg) {

	//проверяем плохие сообщения
	if (msg===null || msg===undefined)
		return;

	//принимаем только положительный ответ от соответствующего соперника и начинаем игру
	if (msg.message==="ACCEPT"  && pending_player===msg.sender && state !== "p") {
		//в данном случае я мастер и хожу вторым
		opp_data.uid=msg.sender;
		game_id=msg.game_id;
		cards_menu.accepted_invite(msg.seed);
	}

	//принимаем также отрицательный ответ от соответствующего соперника
	if (msg.message==="REJECT"  && pending_player === msg.sender) {
		cards_menu.rejected_invite();
	}

	//получение сообщение в состояни игры
	if (state==="p") {

		//учитываем только сообщения от соперника
		if (msg.sender===opp_data.uid) {

			//получение отказа от игры
			if (msg.message==="REFUSE")
				confirm_dialog.opponent_confirm_play(0);

			//получение согласия на игру
			if (msg.message==="CONF")
				confirm_dialog.opponent_confirm_play(1);

			//получение стикера
			if (msg.message==="MSG")
				stickers.receive(msg.data);

			//получение сообщение о продолжении игры
			if (msg.message==="CN" )
				wait_confirm_from_opponent.opp_confirm_flag = 1;
			
			//получение сообщение с ходом игорка
			if (msg.message==="CHAT")
				mp_game.chat(msg.data);
			
			//получение сообщение с сдаче
			if (msg.message==="NO_RESUME" )
				wait_confirm_from_opponent.opp_confirm_flag = 2;

			//получение сообщение с ходом игорка
			if (msg.message==='MOVE')
				bet_making.recv_bet_online(msg.data);
			
		}
	}

	//приглашение поиграть
	if(state==="o" || state==="b") {
		if (msg.message==="INV") {
			req_dialog.show(msg.sender);
		}
		if (msg.message==="INV_REM") {
			//запрос игры обновляет данные оппонента поэтому отказ обрабатываем только от актуального запроса
			if (msg.sender === req_dialog._opp_data.uid)
				req_dialog.hide(msg.sender);
		}
	}

}

req_dialog = {

	_opp_data : {} ,
	
	show(uid) {

		firebase.database().ref("players/"+uid).once('value').then((snapshot) => {

			//не показываем диалог если мы в игре
			if (state === 'p')
				return;

			player_data=snapshot.val();

			//показываем окно запроса только если получили данные с файербейс
			if (player_data===null) {
				//console.log("Не получилось загрузить данные о сопернике");
			}	else	{

				//так как успешно получили данные о сопернике то показываем окно
				sound.play('receive_sticker');
			
				anim2.add(objects.req_cont,{y:[-260, objects.req_cont.sy]}, true, 0.75,'easeOutElastic');


				//Отображаем  имя и фамилию в окне приглашения
				req_dialog._opp_data.name=player_data.name;
				make_text(objects.req_name,player_data.name,200);
				objects.req_rating.text=player_data.rating;
				req_dialog._opp_data.rating=player_data.rating;

				//throw "cut_string erroor";
				req_dialog._opp_data.uid = uid;

				//загружаем фото
				this.load_photo(player_data.pic_url);

			}
		});
	},

	load_photo: function(pic_url) {


		//сначала смотрим на загруженные аватарки в кэше
		if (PIXI.utils.TextureCache[pic_url]===undefined || PIXI.utils.TextureCache[pic_url].width===1) {

			//console.log("Загружаем текстуру "+objects.mini_cards[id].name)
			var loader = new PIXI.Loader();
			loader.add("inv_avatar", pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE});
			loader.load((loader, resources) => {
				objects.req_avatar.texture=loader.resources.inv_avatar.texture;
			});
		}
		else
		{
			//загружаем текустуру из кэша
			//console.log("Ставим из кэша "+objects.mini_cards[id].name)
			objects.req_avatar.texture=PIXI.utils.TextureCache[pic_url];
		}

	},

	reject: function() {

		if (objects.req_cont.ready===false || objects.req_cont.visible===false)
			return;
		
		sound.play('close');



		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');

		firebase.database().ref("inbox/"+req_dialog._opp_data.uid).set({sender:my_data.uid,message:"REJECT",tm:Date.now()});
	},

	accept: function() {

		if (objects.req_cont.ready===false || objects.req_cont.visible===false ||  objects.confirm_cont.visible===true || objects.big_message_cont.visible===true || anim2.any_on() === true)
			return;
		
		//устанавливаем окончательные данные оппонента
		opp_data = req_dialog._opp_data;	
	
		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');

		//отправляем информацию о согласии играть с идентификатором игры
		game_id=~~(Math.random()*999);
						
		//сид для колоды
		let seed = irnd(0,999999);
		
		
		//отправляем данные о начальных параметрах игры сопернику
		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"ACCEPT", tm:Date.now(), game_id : game_id, seed : seed});

		//заполняем карточку оппонента
		make_text(objects.opp_card_name,opp_data.name,150);
		objects.opp_card_rating.text=objects.req_rating.text;
		objects.opp_avatar.texture=objects.req_avatar.texture;

		main_menu.close();
		cards_menu.close();
		sp_game.switch_close();
		
		game.activate(ME, mp_game, seed);

	},

	hide: function() {

		//если диалог не открыт то ничего не делаем
		if (objects.req_cont.ready === false || objects.req_cont.visible === false)
			return;
	
		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');

	}

}

feedback = {
		
	keys_data : [[50,180,80,218.33,'1'],[90,180,120,218.33,'2'],[130,180,160,218.33,'3'],[170,180,200,218.33,'4'],[210,180,240,218.33,'5'],[250,180,280,218.33,'6'],[290,180,320,218.33,'7'],[330,180,360,218.33,'8'],[370,180,400,218.33,'9'],[410,180,440,218.33,'0'],[450,180,550,218.33,'<'],[70,227.9,100,266.23,'Й'],[110,227.9,140,266.23,'Ц'],[150,227.9,180,266.23,'У'],[190,227.9,220,266.23,'К'],[230,227.9,260,266.23,'Е'],[270,227.9,300,266.23,'Н'],[310,227.9,340,266.23,'Г'],[350,227.9,380,266.23,'Ш'],[390,227.9,420,266.23,'Щ'],[430,227.9,460,266.23,'З'],[470,227.9,500,266.23,'Х'],[510,227.9,540,266.23,'Ъ'],[90,275.8,120,314.13,'Ф'],[130,275.8,160,314.13,'Ы'],[170,275.8,200,314.13,'В'],[210,275.8,240,314.13,'А'],[250,275.8,280,314.13,'П'],[290,275.8,320,314.13,'Р'],[330,275.8,360,314.13,'О'],[370,275.8,400,314.13,'Л'],[410,275.8,440,314.13,'Д'],[450,275.8,480,314.13,'Ж'],[490,275.8,520,314.13,'Э'],[70,323.8,100,362.13,'!'],[110,323.8,140,362.13,'Я'],[150,323.8,180,362.13,'Ч'],[190,323.8,220,362.13,'С'],[230,323.8,260,362.13,'М'],[270,323.8,300,362.13,'И'],[310,323.8,340,362.13,'Т'],[350,323.8,380,362.13,'Ь'],[390,323.8,420,362.13,'Б'],[430,323.8,460,362.13,'Ю'],[470,323.8,500,362.13,')'],[510,323.8,540,362.13,'?'],[30,371.7,180,410.03,'ЗАКРЫТЬ'],[190,371.7,420,410.03,'_'],[430,371.7,570,410.03,'ОТПРАВИТЬ']],
	p_resolve : 0,
	MAX_SYMBOLS : 50,
	uid:0,
	
	show : function(uid) {
		
		this.uid = uid;
		objects.feedback_msg.text ='';
		objects.feedback_control.text = `0/${this.MAX_SYMBOLS}`
				
		anim2.add(objects.feedback_cont,{y:[-400, objects.feedback_cont.sy]}, true, 0.4,'easeOutBack');	
		return new Promise(function(resolve, reject){					
			feedback.p_resolve = resolve;	  		  
		});
		
	},
	
	close : function() {
			
		anim2.add(objects.feedback_cont,{y:[objects.feedback_cont.y,450]}, false, 0.4,'easeInBack');		
		
	},
	
	get_texture_for_key (key) {
		
		if (key === '<') return gres.hl_key1.texture;
		if (key === 'ЗАКРЫТЬ' || key === 'ОТПРАВИТЬ') return gres.hl_key2.texture;
		if (key === '_') return gres.hl_key3.texture;
		return gres.hl_key0.texture;
	},
	
	key_down : function(key) {
		
		
		if (objects.feedback_cont.visible === false || objects.feedback_cont.ready === false) return;
		
		key = key.toUpperCase();
		
		if (key === 'ESCAPE') key = 'ЗАКРЫТЬ';			
		if (key === 'ENTER') key = 'ОТПРАВИТЬ';
		if (key === 'BACKSPACE') key = '<';
		if (key === ' ') key = '_';
			
		var result = this.keys_data.find(k => {
			return k[4] === key
		})
		
		if (result === undefined) return;
		this.pointerdown(null,result)
		

		
	},
	
	pointerdown : function(e, inp_key) {
		
		let key = -1;
		let key_x = 0;
		let key_y = 0;		
		
		if (e !== null) {
			
			let mx = e.data.global.x/app.stage.scale.x - objects.feedback_cont.x;
			let my = e.data.global.y/app.stage.scale.y- objects.feedback_cont.y;;

			let margin = 5;
			for (let k of this.keys_data) {			
				if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin) {
					key = k[4];
					key_x = k[0];
					key_y = k[1];
					break;
				}
			}			
			
		} else {
			
			key = inp_key[4];
			key_x = inp_key[0];
			key_y = inp_key[1];
			
		}
		
		
		
		//не нажата кнопка
		if (key === -1) return;			
				
		//подсвечиваем клавишу
		objects.hl_key.x = key_x - 10;
		objects.hl_key.y = key_y - 10;		
		objects.hl_key.texture = this.get_texture_for_key(key);
		anim2.add(objects.hl_key,{alpha:[1, 0]}, false, 0.5,'linear');
						
		if (key === '<') {
			objects.feedback_msg.text=objects.feedback_msg.text.slice(0, -1);
			key ='';
		}			
		
		if (key === 'ЗАКРЫТЬ') {
			this.close();
			this.p_resolve(['close','']);	
			key ='';
			sound.play('keypress');
			return;	
		}	
		
		if (key === 'ОТПРАВИТЬ') {
			
			if (objects.feedback_msg.text === '') return;
			
			//если нашли ненормативную лексику то закрываем
			let mats = /(?<=^|[^а-я])(([уyu]|[нзnz3][аa]|(хитро|не)?[вvwb][зz3]?[ыьъi]|[сsc][ьъ']|(и|[рpr][аa4])[зсzs]ъ?|([оo0][тбtb6]|[пp][оo0][дd9])[ьъ']?|(.\B)+?[оаеиeo])?-?([еёe][бb6](?!о[рй])|и[пб][ае][тц]).*?|([нn][иеаaie]|([дпdp]|[вv][еe3][рpr][тt])[оo0]|[рpr][аa][зсzc3]|[з3z]?[аa]|с(ме)?|[оo0]([тt]|дно)?|апч)?-?[хxh][уuy]([яйиеёюuie]|ли(?!ган)).*?|([вvw][зы3z]|(три|два|четыре)жды|(н|[сc][уuy][кk])[аa])?-?[бb6][лl]([яy](?!(х|ш[кн]|мб)[ауеыио]).*?|[еэe][дтdt][ь']?)|([рp][аa][сзc3z]|[знzn][аa]|[соsc]|[вv][ыi]?|[пp]([еe][рpr][еe]|[рrp][оиioеe]|[оo0][дd])|и[зс]ъ?|[аоao][тt])?[пpn][иеёieu][зz3][дd9].*?|([зz3][аa])?[пp][иеieu][дd][аоеaoe]?[рrp](ну.*?|[оаoa][мm]|([аa][сcs])?([иiu]([лl][иiu])?[нщктлtlsn]ь?)?|([оo](ч[еиei])?|[аa][сcs])?[кk]([оo]й)?|[юu][гg])[ауеыauyei]?|[мm][аa][нnh][дd]([ауеыayueiи]([лl]([иi][сзc3щ])?[ауеыauyei])?|[оo][йi]|[аоao][вvwb][оo](ш|sh)[ь']?([e]?[кk][ауеayue])?|юк(ов|[ауи])?)|[мm][уuy][дd6]([яyаиоaiuo0].*?|[еe]?[нhn]([ьюия'uiya]|ей))|мля([тд]ь)?|лять|([нз]а|по)х|м[ао]л[ао]фь([яию]|[её]й))(?=($|[^а-я]))/i;
			if (objects.feedback_msg.text.match(mats)) {
				this.close();
				this.p_resolve(['close','']);	
				key ='';
				return;
			}
			
			this.close();
			this.p_resolve(['sent',objects.feedback_msg.text]);	
			key ='';
			sound.play('keypress');
			return;	
		}	
		
		
		
		if (objects.feedback_msg.text.length >= this.MAX_SYMBOLS)  {
			sound.play('locked');
			return;			
		}
		
		if (key === '_') {
			objects.feedback_msg.text += ' ';	
			key ='';
		}			
		

		sound.play('keypress');
		
		objects.feedback_msg.text += key;	
		objects.feedback_control.text = `${objects.feedback_msg.text.length}/${this.MAX_SYMBOLS}`		
		
	}
	
}

main_menu= {

	activate: async function() {

				

		some_process.main_menu = this.process;
		anim2.add(objects.mb_cont,{x:[800,objects.mb_cont.sx]}, true, 1,'easeInOutCubic');
		anim2.add(objects.game_title,{y:[-300,objects.game_title.sy]}, true, 1,'easeInOutCubic');
		objects.desktop.texture = gres.desktop.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.6,'linear');
	},
	
	process : function() {

	},

	close : async function() {

		//some_process.main_menu = function(){};
		objects.mb_cont.visible=false;
		some_process.main_menu_process = function(){};
		anim2.add(objects.mb_cont,{x:[objects.mb_cont.x,800]}, true, 1,'easeInOutCubic');
		anim2.add(objects.game_title,{y:[objects.game_title.y,-300]}, true, 1,'linear');
		//await anim2.add(objects.desktop,{alpha:[1,0]}, false, 0.6,'linear');	
	},

	pb_down: async function () {

		if (anim2.any_on()===true || objects.id_cont.visible === true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		cards_menu.activate();

	},
	
	lb_button_down: async function () {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		lb.show();

	},

	rules_button_down: async function () {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');
	
		await this.close();
		rules.activate();


	},

	chips_button_down : async function() {
		
		
		let res = await confirm_dialog.show('Получить 100 фишек за просмотр рекламы?');
		if (res = 'ok') {
			
			table.update_balance(ME,100);
		}
		
	},

	rules_ok_down: function () {

		anim2.add(objects.rules_cont,{y:[objects.rules_cont.sy, -450]}, false, 0.5,'easeInBack');

	},

}

lb = {
	
	active : 0,
	cards_pos: [[370,10],[380,70],[390,130],[380,190],[360,250],[330,310],[290,370]],

	show: function() {

		this.active = 1;
		objects.desktop.visible=true;
		objects.desktop.texture=game_res.resources.lb_bcg.texture;

		
		anim2.add(objects.leader_header,{y:[-50, objects.leader_header.sy]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_1_cont,{x:[-150, objects.lb_1_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_2_cont,{x:[-150, objects.lb_2_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_3_cont,{x:[-150, objects.lb_3_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_cards_cont,{x:[450, 0]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.lb_back_button,{x:[800, objects.lb_back_button.sx]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 1,'linear');			


		for (let i=0;i<7;i++) {
			objects.lb_cards[i].x=this.cards_pos[i][0];
			objects.lb_cards[i].y=this.cards_pos[i][1];
			objects.lb_cards[i].place.text=(i+4)+".";

		}


		this.update();

	},

	close: async function() {

		this.active = 0;
		anim2.add(objects.leader_header,{y:[objects.leader_header.y,-50]}, true, 0.5,'easeInBack');
		anim2.add(objects.lb_1_cont,{x:[objects.lb_1_cont.x,-150]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_2_cont,{x:[objects.lb_2_cont.x,-150]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_3_cont,{x:[objects.lb_3_cont.x,-150]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_cards_cont,{x:[objects.lb_cards_cont.x, 450]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_back_button,{x:[objects.lb_back_button.x, 800]}, false, 0.5,'easeInBack');
		await anim2.add(objects.desktop,{alpha:[1,0]}, false, 0.6,'linear');		

	},

	back_button_down: async function() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');
		await this.close();
		main_menu.activate();

	},

	update: function () {

		firebase.database().ref("players").orderByChild('rating').limitToLast(25).once('value').then((snapshot) => {

			if (snapshot.val()===null) {
			  //console.log("Что-то не получилось получить данные о рейтингах");
			}
			else {

				var players_array = [];
				snapshot.forEach(players_data=> {
					if (players_data.val().name!=="" && players_data.val().name!=='')
						players_array.push([players_data.val().name, players_data.val().rating, players_data.val().pic_url]);
				});


				players_array.sort(function(a, b) {	return b[1] - a[1];});

				//создаем загрузчик топа
				var loader = new PIXI.Loader();

				var len=Math.min(10,players_array.length);

				//загружаем тройку лучших
				for (let i=0;i<3;i++) {
					if (players_array[i]!== undefined) {						
						make_text(objects['lb_'+(i+1)+'_name'],players_array[i][0],180);					
						objects['lb_'+(i+1)+'_rating'].text=players_array[i][1];
						loader.add('leaders_avatar_'+i, players_array[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE});						
					}
				};

				//загружаем остальных
				for (let i=3;i<10;i++) {
					if (players_array[i]!== undefined) {
						
						let fname=players_array[i][0];
						make_text(objects.lb_cards[i-3].name,fname,180);
						objects.lb_cards[i-3].rating.text=players_array[i][1];
						loader.add('leaders_avatar_'+i, players_array[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE});						
					} 
				};

				loader.load();

				//показываем аватар как только он загрузился
				loader.onProgress.add((loader, resource) => {
					let lb_num=Number(resource.name.slice(-1));
					if (lb_num<3)
						objects['lb_'+(lb_num+1)+'_avatar'].texture=resource.texture
					else
						objects.lb_cards[lb_num-3].avatar.texture=resource.texture;
				});

			}

		});

	}

}

rules = {
	
	active : 0,
	
	activate : function() {
		
		this.active = 1;
		anim2.add(objects.desktop,{alpha:[0,0.5]}, true, 0.6,'linear');	
		anim2.add(objects.rules_back_button,{x:[800, objects.rules_back_button.sx]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.rules_text,{alpha:[0, 1]}, true, 1,'linear');
				
		objects.rules_text.text = ['Добро пожаловать в игру Дурак!\n\nЭто самая популярная в России карточная игра. В игре используется колода из 36 карт. Цель игры – избавиться от всех карт. Первым ходом кидайте любую карту. Кроющийся должен покрыть каждую подкинутую под него карту картой той же масти, но большего достоинства, или любым козырем. Козырную карту можно покрыть только козырем большего достоинства. Козырная масть определяется картой под колодой.Проигрывает игрок, последним оставшийся с картами на руках.'][LANG];
	},
	
	back_button_down : async function() {
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
		
		
		sound.play('click');
		await this.close();
		main_menu.activate();
		
	},
	
	close : async function() {
		
		this.active = 0;
		anim2.add(objects.rules_text,{alpha:[1, 0]}, false, 0.5,'linear');
		anim2.add(objects.desktop,{alpha:[1, 0]}, false, 0.5,'linear');
		await anim2.add(objects.rules_back_button,{x:[objects.rules_back_button.x, 800]}, false, 0.5,'easeInCubic');
		
		
	}	
	
	
}

stickers={
	
	promise_resolve_send :0,
	promise_resolve_recive :0,

	show_panel: function() {

		
		if (objects.big_message_cont.visible === true || objects.req_cont.visible === true || objects.stickers_cont.ready===false) {
			return;			
		}



		//ничего не делаем если панель еще не готова
		if (objects.stickers_cont.ready===false || objects.stickers_cont.visible===true || state!=="p")
			return;

		//анимационное появление панели стикеров
		anim2.add(objects.stickers_cont,{y:[450, objects.stickers_cont.sy]}, true, 0.5,'easeOutBack');

	},

	hide_panel: function() {

		//game_res.resources.close.sound.play();

		if (objects.stickers_cont.ready===false)
			return;

		//анимационное появление панели стикеров
		anim2.add(objects.stickers_cont,{y:[objects.stickers_cont.sy, -450]}, false, 0.5,'easeInBack');

	},

	send : async function(id) {

		if (objects.big_message_cont.visible === true || objects.req_cont.visible === true || objects.stickers_cont.ready===false) {
			return;			
		}
		
		if (this.promise_resolve_send!==0)
			this.promise_resolve_send("forced");

		this.hide_panel();

		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"MSG",tm:Date.now(),data:id});
		message.add(['Стикер отправлен сопернику','Sticker was sent to the opponent'][LANG]);

		//показываем какой стикер мы отправили
		objects.sent_sticker_area.texture=game_res.resources['sticker_texture_'+id].texture;
		
		await anim2.add(objects.sent_sticker_area,{alpha:[0, 0.5]}, true, 0.5,'linear');
		
		let res = await new Promise((resolve, reject) => {
				stickers.promise_resolve_send = resolve;
				setTimeout(resolve, 2000)
			}
		);
		
		if (res === "forced")
			return;

		await anim2.add(objects.sent_sticker_area,{alpha:[0.5, 0]}, false, 0.5,'linear');
	},

	receive: async function(id) {

		
		if (this.promise_resolve_recive!==0)
			this.promise_resolve_recive("forced");

		//воспроизводим соответствующий звук
		//game_res.resources.receive_sticker.sound.play();

		objects.rec_sticker_area.texture=game_res.resources['sticker_texture_'+id].texture;
	
		await anim2.add(objects.rec_sticker_area,{x:[-150, objects.rec_sticker_area.sx]}, true, 0.5,'easeOutBack');

		let res = await new Promise((resolve, reject) => {
				stickers.promise_resolve_recive = resolve;
				setTimeout(resolve, 2000)
			}
		);
		
		if (res === "forced")
			return;

		anim2.add(objects.rec_sticker_area,{x:[objects.rec_sticker_area.sx, -150]}, false, 0.5,'easeInBack');

	}

}

cards_menu={
	
	state_tint :{},
	_opp_data : {},
	pover : 0,
	uid_pic_url_cache : {},
	
	cards_pos: [
				[0,0],[0,90],[0,180],[0,270],
				[190,0],[190,90],[190,180],[190,270],
				[380,0],[380,90],[380,180],[380,270],
				[570,0],[570,90],[570,180]

				],

	activate: function () {



		objects.desktop.texture=game_res.resources.cards_bcg.texture;
		anim2.add(objects.cards_menu_header,{y:[-50, objects.cards_menu_header.sy]}, true, 0.5,'easeOutBack');
		anim2.add(objects.cards_cont,{alpha:[0,1]}, true, 0.4,'linear');		
		anim2.add(objects.back_button,{x:[800, objects.back_button.sx]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.4,'linear');
		anim2.add(objects.players_online,{y:[470, objects.players_online.sy]}, true, 0.5,'easeOutCubic');

		//расставляем по соответствующим координатам
		for(let i=0;i<15;i++) {
			objects.mini_cards[i].x=this.cards_pos[i][0];
			objects.mini_cards[i].y=this.cards_pos[i][1];
		}


		//отключаем все карточки
		this.card_i=1;
		for(let i=1;i<15;i++)
			objects.mini_cards[i].visible=false;

		//добавляем карточку ии
		this.add_card_ai();

		
		
		//подписываемся на изменения состояний пользователей
		firebase.database().ref(room_name) .on('value', (snapshot) => {cards_menu.players_list_updated(snapshot.val());});

	},

	players_list_updated: function(players) {

		//если мы в игре то не обновляем карточки
		if (state==="p" || state==="b")
			return;


		//это столы
		let tables = {};
		
		//это свободные игроки
		let single = {};


		//делаем дополнительный объект с игроками и расширяем id соперника
		let p_data = JSON.parse(JSON.stringify(players));
		
		//создаем массив свободных игроков
		for (let uid in players){			
			if (players[uid].state !== 'p' && players[uid].hidden === 0)
				single[uid] = players[uid].name;						
		}
		
		//console.table(single);
		
		//убираем не играющие состояние
		for (let uid in p_data)
			if (p_data[uid].state !== 'p')
				delete p_data[uid];
		
		
		//дополняем полными ид оппонента
		for (let uid in p_data) {			
			let small_opp_id = p_data[uid].opp_id;			
			//проходимся по соперникам
			for (let uid2 in players) {	
				let s_id=uid2.substring(0,10);				
				if (small_opp_id === s_id) {
					//дополняем полным id
					p_data[uid].opp_id = uid2;
				}							
			}			
		}
				
		
		//определяем столы
		//console.log (`--------------------------------------------------`)
		for (let uid in p_data) {
			let opp_id = p_data[uid].opp_id;
			let name1 = p_data[uid].name;
			let rating = p_data[uid].rating;
			let hid = p_data[uid].hidden;
			
			if (p_data[opp_id] !== undefined) {
				
				if (uid === p_data[opp_id].opp_id && tables[uid] === undefined) {
					
					tables[uid] = opp_id;					
					//console.log(`${name1} (Hid:${hid}) (${rating}) vs ${p_data[opp_id].name} (Hid:${p_data[opp_id].hidden}) (${p_data[opp_id].rating}) `)	
					delete p_data[opp_id];				
				}
				
			} else 
			{				
				//console.log(`${name1} (${rating}) - одиночка `)					
			}			
		}
					
		
		
		//считаем и показываем количество онлайн игрокова
		let num = 0;
		for (let uid in players)
			if (players[uid].hidden===0)
				num++
			
		objects.players_online.text=['Игроков онлайн: ','Players online: '][LANG] + num + ['     ( комната: ','     ( room: '][LANG] + room_name +' )';
		
		
		//считаем сколько одиночных игроков и сколько столов
		let num_of_single = Object.keys(single).length;
		let num_of_tables = Object.keys(tables).length;
		let num_of_cards = num_of_single + num_of_tables;
		
		//если карточек слишком много то убираем столы
		if (num_of_cards > 14) {
			let num_of_tables_cut = num_of_tables - (num_of_cards - 14);			
			
			let num_of_tables_to_cut = num_of_tables - num_of_tables_cut;
			
			//удаляем столы которые не помещаются
			let t_keys = Object.keys(tables);
			for (let i = 0 ; i < num_of_tables_to_cut ; i++) {
				delete tables[t_keys[i]];
			}
		}

		
		//убираем карточки пропавших игроков и обновляем карточки оставшихся
		for(let i=1;i<15;i++) {			
			if (objects.mini_cards[i].visible === true && objects.mini_cards[i].type === 'single') {				
				let card_uid = objects.mini_cards[i].uid;				
				if (single[card_uid] === undefined)					
					objects.mini_cards[i].visible = false;
				else
					this.update_existing_card({id:i, state:players[card_uid].state , rating:players[card_uid].rating});
			}
		}



		
		//определяем новых игроков которых нужно добавить
		new_single = {};		
		
		for (let p in single) {
			
			let found = 0;
			for(let i=1;i<15;i++) {			
			
				if (objects.mini_cards[i].visible === true && objects.mini_cards[i].type === 'single') {					
					if (p ===  objects.mini_cards[i].uid) {
						
						found = 1;							
					}	
				}				
			}		
			
			if (found === 0)
				new_single[p] = single[p];
		}
		

		
		//убираем исчезнувшие столы (если их нет в новом перечне) и оставляем новые
		for(let i=1;i<15;i++) {			
		
			if (objects.mini_cards[i].visible === true && objects.mini_cards[i].type === 'table') {
				
				let uid1 = objects.mini_cards[i].uid1;	
				let uid2 = objects.mini_cards[i].uid2;	
				
				let found = 0;
				
				for (let t in tables) {
					
					let t_uid1 = t;
					let t_uid2 = tables[t];				
					
					if (uid1 === t_uid1 && uid2 === t_uid2) {
						delete tables[t];
						found = 1;						
					}							
				}
								
				if (found === 0)
					objects.mini_cards[i].visible = false;
			}	
		}
		
		
		//размещаем на свободных ячейках новых игроков
		for (let uid in new_single)			
			this.place_new_card({uid:uid, state:players[uid].state, name : players[uid].name,  rating : players[uid].rating});

		//размещаем новые столы сколько свободно
		for (let uid in tables) {			
			let n1=players[uid].name
			let n2=players[tables[uid]].name
			
			let r1= players[uid].rating
			let r2= players[tables[uid]].rating
			this.place_table({uid1:uid,uid2:tables[uid],name1: n1, name2: n2, rating1: r1, rating2: r2});
		}
		
	},

	get_state_tint: function(s) {

		switch(s) {

			case "o":
				return this.state_tint.o;
			break;

			case "b":
				return this.state_tint.b;
			break;

			case "p":
				return this.state_tint.p;
			break;
			
			case "bot":
				return this.state_tint.bot;
			break;

		}
	},

	place_table : function (params={uid1:0,uid2:0,name1: "XXX",name2: "XXX", rating1: 1400, rating2: 1400}) {
				
		for(let i=1;i<15;i++) {

			//это если есть вакантная карточка
			if (objects.mini_cards[i].visible===false) {

				//устанавливаем цвет карточки в зависимости от состояния
				objects.mini_cards[i].bcg.tint=this.get_state_tint(params.state);
				objects.mini_cards[i].state=params.state;

				objects.mini_cards[i].type = "table";
				
				
				objects.mini_cards[i].bcg.texture = gres.mini_player_card_table.texture;
				objects.mini_cards[i].bcg.tint=this.get_state_tint('p');
				
				//присваиваем карточке данные
				//objects.mini_cards[i].uid=params.uid;
				objects.mini_cards[i].uid1=params.uid1;
				objects.mini_cards[i].uid2=params.uid2;
												
				//убираем элементы свободного стола
				objects.mini_cards[i].rating_text.visible = false;
				objects.mini_cards[i].avatar.visible = false;
				objects.mini_cards[i].name_text.visible = false;

				//Включаем элементы стола 
				objects.mini_cards[i].rating_text1.visible = true;
				objects.mini_cards[i].rating_text2.visible = true;
				objects.mini_cards[i].avatar1.visible = true;
				objects.mini_cards[i].avatar2.visible = true;
				objects.mini_cards[i].rating_bcg.visible = true;

				objects.mini_cards[i].rating_text1.text = params.rating1;
				objects.mini_cards[i].rating_text2.text = params.rating2;
				
				objects.mini_cards[i].name1 = params.name1;
				objects.mini_cards[i].name2 = params.name2;

				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid1, tar_obj:objects.mini_cards[i].avatar1});
				
				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid2, tar_obj:objects.mini_cards[i].avatar2});


				objects.mini_cards[i].visible=true;


				break;
			}
		}
		
	},

	update_existing_card: function(params={id:0, state:"o" , rating:1400}) {

		//устанавливаем цвет карточки в зависимости от состояния(имя и аватар не поменялись)
		objects.mini_cards[params.id].bcg.tint=this.get_state_tint(params.state);
		objects.mini_cards[params.id].state=params.state;

		objects.mini_cards[params.id].rating=params.rating;
		objects.mini_cards[params.id].rating_text.text=params.rating;
		objects.mini_cards[params.id].visible=true;
	},

	place_new_card: function(params={uid:0, state: "o", name: "XXX", rating: rating}) {

		for(let i=1;i<15;i++) {

			//это если есть вакантная карточка
			if (objects.mini_cards[i].visible===false) {

				//устанавливаем цвет карточки в зависимости от состояния
				objects.mini_cards[i].bcg.texture = gres.mini_player_card.texture;
				objects.mini_cards[i].bcg.tint=this.get_state_tint(params.state);
				objects.mini_cards[i].state=params.state;

				objects.mini_cards[i].type = "single";

				//присваиваем карточке данные
				objects.mini_cards[i].uid=params.uid;

				//убираем элементы стола так как они не нужны
				objects.mini_cards[i].rating_text1.visible = false;
				objects.mini_cards[i].rating_text2.visible = false;
				objects.mini_cards[i].avatar1.visible = false;
				objects.mini_cards[i].avatar2.visible = false;
				objects.mini_cards[i].rating_bcg.visible = false;
				
				//включаем элементы свободного стола
				objects.mini_cards[i].rating_text.visible = true;
				objects.mini_cards[i].avatar.visible = true;
				objects.mini_cards[i].name_text.visible = true;

				objects.mini_cards[i].name=params.name;
				make_text(objects.mini_cards[i].name_text,params.name,110);
				objects.mini_cards[i].rating=params.rating;
				objects.mini_cards[i].rating_text.text=params.rating;

				objects.mini_cards[i].visible=true;

				//стираем старые данные
				objects.mini_cards[i].avatar.texture=PIXI.Texture.EMPTY;

				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid, tar_obj:objects.mini_cards[i].avatar});

				//console.log(`новая карточка ${i} ${params.uid}`)
				break;
			}
		}

	},

	get_texture : function (pic_url) {
		
		return new Promise((resolve,reject)=>{
			
			//меняем адрес который невозможно загрузить
			if (pic_url==="https://vk.com/images/camera_100.png")
				pic_url = "https://i.ibb.co/fpZ8tg2/vk.jpg";

			//сначала смотрим на загруженные аватарки в кэше
			if (PIXI.utils.TextureCache[pic_url]===undefined || PIXI.utils.TextureCache[pic_url].width===1) {

				//загружаем аватарку игрока
				//console.log(`Загружаем url из интернети или кэша браузера ${pic_url}`)	
				let loader=new PIXI.Loader();
				loader.add("pic", pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});
				loader.load(function(l,r) {	resolve(l.resources.pic.texture)});
			}
			else
			{
				//загружаем текустуру из кэша
				//console.log(`Текстура взята из кэша ${pic_url}`)	
				resolve (PIXI.utils.TextureCache[pic_url]);
			}
		})
		
	},
	
	get_uid_pic_url : function (uid) {
		
		return new Promise((resolve,reject)=>{
						
			//проверяем есть ли у этого id назначенная pic_url
			if (this.uid_pic_url_cache[uid] !== undefined) {
				//console.log(`Взяли pic_url из кэша ${this.uid_pic_url_cache[uid]}`);
				resolve(this.uid_pic_url_cache[uid]);		
				return;
			}

							
			//получаем pic_url из фб
			firebase.database().ref("players/" + uid + "/pic_url").once('value').then((res) => {

				pic_url=res.val();
				
				if (pic_url === null) {
					
					//загрузить не получилось поэтому возвращаем случайную картинку
					resolve('https://avatars.dicebear.com/v2/male/'+irnd(10,10000)+'.svg');
				}
				else {
					
					//добавляем полученный pic_url в кэш
					//console.log(`Получили pic_url из ФБ ${pic_url}`)	
					this.uid_pic_url_cache[uid] = pic_url;
					resolve (pic_url);
				}
				
			});		
		})
		
	},
	
	load_avatar2 : function (params = {uid : 0, tar_obj : 0, card_id : 0}) {
		
		//получаем pic_url
		this.get_uid_pic_url(params.uid).then(pic_url => {
			return this.get_texture(pic_url);
		}).then(t=>{			
			params.tar_obj.texture=t;			
		})	
	},

	add_card_ai: function() {

		//убираем элементы стола так как они не нужны
		objects.mini_cards[0].rating_text1.visible = false;
		objects.mini_cards[0].rating_text2.visible = false;
		objects.mini_cards[0].avatar1.visible = false;
		objects.mini_cards[0].avatar2.visible = false;
		objects.mini_cards[0].rating_bcg.visible = false;

		objects.mini_cards[0].bcg.tint=this.state_tint.bot;
		objects.mini_cards[0].visible=true;
		objects.mini_cards[0].uid="BOT";
		objects.mini_cards[0].name=['Дурак (бот)', 'Chapaev (bot)'][LANG];
		objects.mini_cards[0].name_text.text=['Дурак (бот)', 'Chapaev (bot)'][LANG];
		objects.mini_cards[0].rating_text.text="1400";
		objects.mini_cards[0].rating=999;
		objects.mini_cards[0].avatar.texture=game_res.resources.pc_icon.texture;
	},
	
	card_down : function ( card_id ) {
		
		if (objects.mini_cards[card_id].type === 'single')
			this.show_invite_dialog(card_id);
		
		if (objects.mini_cards[card_id].type === 'table')
			this.show_table_dialog(card_id);
				
	},
	
	show_table_dialog : function (card_id) {
		
		if (anim2.any_on === true) {
			sound.play('locked');
			return
		};

		
		anim2.add(objects.td_cont,{y:[-150, objects.td_cont.sy]}, true, 0.5,'easeOutBack');
		
		objects.td_avatar1.texture = objects.mini_cards[card_id].avatar1.texture;
		objects.td_avatar2.texture = objects.mini_cards[card_id].avatar2.texture;
		
		objects.td_rating1.text = objects.mini_cards[card_id].rating_text1.text;
		objects.td_rating2.text = objects.mini_cards[card_id].rating_text2.text;
		
		make_text(objects.td_name1, objects.mini_cards[card_id].name1, 150);
		make_text(objects.td_name2, objects.mini_cards[card_id].name2, 150);
		
	},
	
	close_table_dialog : function () {
		
		sound.play('close');
		
		anim2.add(objects.td_cont,{y:[objects.td_cont.sy, 400]}, false, 0.5,'easeInBack');

		
	},

	show_invite_dialog: function(card_id) {

		if (anim2.any_on() === true) {
			sound.play('locked');
			return
		};

		pending_player="";

		sound.play('click');
			
		
		objects.invite_feedback.text = '';

		//показыаем кнопку приглашения
		objects.invite_button.texture=game_res.resources.invite_button.texture;
	
		anim2.add(objects.invite_cont,{x:[800, objects.invite_cont.sx]}, true, 0.15,'linear');
		anim2.add(objects.cards_menu_header,{x:[objects.cards_menu_header.sx,230]}, true, 0.15,'linear');
		anim2.add(objects.players_online,{x:[objects.players_online.sx,230]}, true, 0.15,'linear');
		
		//копируем предварительные данные
		cards_menu._opp_data = {uid:objects.mini_cards[card_id].uid,name:objects.mini_cards[card_id].name,rating:objects.mini_cards[card_id].rating};
		
		//затемняем кнопку если это не наша карточка
		objects.fb_my.alpha = 1;
		if (this._opp_data.uid !== my_data.uid)
			objects.fb_my.alpha = 0.2;		
		
		
		this.show_feedbacks(cards_menu._opp_data.uid);
		
		objects.invite_button_title.text=['Пригласить','Send invite'][LANG];

		let invite_available = 	cards_menu._opp_data.uid !== my_data.uid;
		invite_available=invite_available && (objects.mini_cards[card_id].state==="o" || objects.mini_cards[card_id].state==="b");
		invite_available=invite_available || cards_menu._opp_data.uid==="BOT";
		invite_available=invite_available && cards_menu._opp_data.rating >= BIG_BLIND && my_data.rating >= BIG_BLIND;

		//показыаем кнопку приглашения только если это допустимо
		objects.invite_button.visible=objects.invite_button_title.visible=invite_available;

		//заполняем карточу приглашения данными
		objects.invite_avatar.texture=objects.mini_cards[card_id].avatar.texture;
		make_text(objects.invite_name,cards_menu._opp_data.name,230);
		objects.invite_rating.text=objects.mini_cards[card_id].rating_text.text;

	},

	show_feedbacks: async function(uid) {
		
		
		objects.invite_feedback.text = '';
		objects.invite_feedback.y = 400;
		
		//получаем фидбэки
		let _fb = await firebase.database().ref("fb/" + uid).once('value');
		let fb_obj =_fb.val();
		if (fb_obj === null) {
			objects.invite_feedback.text = '***нет отзывов***'
			return;
		}
		var fb = Object.keys(fb_obj).map((key) => [fb_obj[key][0],fb_obj[key][1],fb_obj[key][2]]);
		
		//выбираем последние отзывы
		fb.sort(function(a,b) {
			return a[1]-b[1]
		});
		
		let fb_cnt = fb.length;
				
		for (let i = 0 ; i < fb_cnt;i++) {
			let sender_name =  fb[i][2] || 'Неизв.';
			if (sender_name.length > 10) sender_name = sender_name.substring(0, 10);			
			objects.invite_feedback.text +=(sender_name + ': ');
			objects.invite_feedback.text +=fb[i][0];
			objects.invite_feedback.text +='\n';	
		}
		
		console.log(objects.invite_feedback.height);
		console.log(objects.invite_feedback.y);	
	},

	close: async function() {


		if (objects.invite_cont.visible === true)
			this.hide_invite_dialog();
		
		if (objects.td_cont.visible === true)
			this.close_table_dialog();

		//плавно все убираем
		anim2.add(objects.cards_menu_header,{y:[ objects.cards_menu_header.y, -50]}, false, 0.4,'easeInCubic');
		anim2.add(objects.cards_cont,{alpha:[1,0]}, false, 0.4,'linear');		
		anim2.add(objects.back_button,{x:[objects.back_button.sx, 800]}, false, 0.5,'easeInCubic');
		anim2.add(objects.desktop,{alpha:[1,0]}, false, 0.4,'linear');
		await anim2.add(objects.players_online,{y:[objects.players_online.y, 470]}, false, 0.5,'easeInCubic');

		//больше ни ждем ответ ни от кого
		pending_player="";
		

		//подписываемся на изменения состояний пользователей
		firebase.database().ref(room_name).off();

	},
	
	wheel_event: function(dir) {
		
		if (this.pover === 0) return;
		
		if (dir === 1)
			this.fb_down_down();
		else
			this.fb_up_down();
		
	},
	
	fb_up_down : function() {
		
		//если дошли до конца
		if (objects.invite_feedback.y - objects.invite_feedback.height  >=220)
			return;
		
		//отпускаем фидбэки ниже
		anim2.add(objects.invite_feedback,{y:[objects.invite_feedback.y, objects.invite_feedback.y+40]}, true, 0.25,'linear');
		
	},
	
	fb_down_down : function() {		

		
		//если дошли до конца
		if (objects.invite_feedback.y <=400)
			return;
		
		//поднимаем
		anim2.add(objects.invite_feedback,{y:[objects.invite_feedback.y, objects.invite_feedback.y-40]}, true, 0.25,'linear');
		
	},
	
	fb_my_down : async function() {
		
		
		if (this._opp_data.uid !== my_data.uid || objects.feedback_cont.visible === true)
			return;
		
		let fb = await feedback.show(this._opp_data.uid);
		
		//перезагружаем отзывы если добавили один
		if (fb[0] === 'sent') {
			let fb_id = irnd(0,50);			
			await firebase.database().ref("fb/"+this._opp_data.uid+"/"+fb_id).set([fb[1], firebase.database.ServerValue.TIMESTAMP, my_data.name]);
			this.show_feedbacks(this._opp_data.uid);			
		}
		
	},

	hide_invite_dialog: function() {

		sound.play('close');

		if (objects.invite_cont.visible===false)
			return;

		//отправляем сообщение что мы уже не заинтересованы в игре
		if (pending_player!=="") {
			firebase.database().ref("inbox/"+pending_player).set({sender:my_data.uid,message:"INV_REM",tm:Date.now()});
			pending_player="";
		}


		anim2.add(objects.invite_cont,{x:[objects.invite_cont.x, 800]}, false, 0.15,'linear');
		anim2.add(objects.cards_menu_header,{x:[230,objects.cards_menu_header.sx]}, true, 0.15,'linear');
		anim2.add(objects.players_online,{x:[230,objects.players_online.sx]}, true, 0.15,'linear');

	},

	send_invite: async function() {


		if (objects.invite_cont.ready===false || objects.invite_cont.visible===false)
			return;

		if (anim2.any_on() === true) {
			sound.play('locked');
			return
		};

		if (cards_menu._opp_data.uid==="BOT")
		{
			await this.close();
			
			//заполняем данные бот-оппонента
			opp_data.rating=999;
			make_text(objects.opp_card_name,cards_menu._opp_data.name,160);
			objects.opp_card_rating.text=opp_data.rating;
			objects.opp_avatar.texture=objects.invite_avatar.texture;			
			game.activate(OPP, sp_game , irnd(0,9999999));
		}
		else
		{
			sound.play('click');
			objects.invite_button_title.text=['Ждите ответ..','Waiting...'][LANG];
			firebase.database().ref("inbox/"+cards_menu._opp_data.uid).set({sender:my_data.uid,message:"INV",tm:Date.now()});
			pending_player=cards_menu._opp_data.uid;

		}

	},

	rejected_invite: function() {

		pending_player="";
		cards_menu._opp_data={};
		this.hide_invite_dialog();
		big_message.show("Соперник отказался от игры",0);

	},

	accepted_invite: async function(seed) {

		//убираем запрос на игру если он открыт
		req_dialog.hide();
		
		//устанаваем окончательные данные оппонента
		opp_data=cards_menu._opp_data;
		
		//сразу карточку оппонента
		make_text(objects.opp_card_name,opp_data.name,160);
		objects.opp_card_rating.text=opp_data.rating;
		objects.opp_avatar.texture=objects.invite_avatar.texture;		

		//закрываем меню и начинаем игру
		await cards_menu.close();
		game.activate(OPP, mp_game ,seed);
	},

	back_button_down: async function() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		main_menu.activate();

	}

}

stickers = {
	
	promise_resolve_send :0,
	promise_resolve_recive :0,

	show_panel: function() {


		if (anim2.any_on()===true ||objects.big_message_cont.visible === true) {
			sound.play('locked');
			return
		};

		if (objects.stickers_cont.ready===false)
			return;
		sound.play('click');


		//ничего не делаем если панель еще не готова
		if (objects.stickers_cont.ready===false || objects.stickers_cont.visible===true || state!=="p")
			return;

		//анимационное появление панели стикеров
		anim2.add(objects.stickers_cont,{y:[450, objects.stickers_cont.sy]}, true, 0.5,'easeOutBack');

	},

	hide_panel: function() {

		sound.play('close');

		if (objects.stickers_cont.ready===false)
			return;

		//анимационное появление панели стикеров
		anim2.add(objects.stickers_cont,{y:[objects.stickers_cont.sy, -450]}, false, 0.5,'easeInBack');

	},

	send : async function(id) {

		if (objects.stickers_cont.ready===false)
			return;
		
		if (this.promise_resolve_send!==0)
			this.promise_resolve_send("forced");

		this.hide_panel();

		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"MSG",tm:Date.now(),data:id});
		message.add("Стикер отправлен сопернику");

		//показываем какой стикер мы отправили
		objects.sent_sticker_area.texture=game_res.resources['sticker_texture_'+id].texture;
		
		await anim2.add(objects.sent_sticker_area,{alpha:[0, 0.5]}, true, 0.5,'linear');
		
		let res = await new Promise((resolve, reject) => {
				stickers.promise_resolve_send = resolve;
				setTimeout(resolve, 2000)
			}
		);
		
		if (res === "forced")
			return;

		await anim2.add(objects.sent_sticker_area,{alpha:[0.5, 0]}, false, 0.5,'linear');
	},

	receive: async function(id) {

		
		if (this.promise_resolve_recive!==0)
			this.promise_resolve_recive("forced");

		//воспроизводим соответствующий звук
		sound.play('receive_sticker');

		objects.rec_sticker_area.texture=game_res.resources['sticker_texture_'+id].texture;
	
		await anim2.add(objects.rec_sticker_area,{x:[-150, objects.rec_sticker_area.sx]}, true, 0.5,'easeOutBack');

		let res = await new Promise((resolve, reject) => {
				stickers.promise_resolve_recive = resolve;
				setTimeout(resolve, 2000)
			}
		);
		
		if (res === "forced")
			return;

		anim2.add(objects.rec_sticker_area,{x:[objects.rec_sticker_area.sx, -150]}, false, 0.5,'easeInBack');

	}

}

auth = function() {
	
	return new Promise((resolve, reject)=>{

		let help_obj = {

			loadScript : function(src) {
			  return new Promise((resolve, reject) => {
				const script = document.createElement('script')
				script.type = 'text/javascript'
				script.onload = resolve
				script.onerror = reject
				script.src = src
				document.head.appendChild(script)
			  })
			},

			init: async function() {

				let s = window.location.href;

				//-----------ЯНДЕКС------------------------------------
				if (s.includes("yandex")) {
					game_platform="YANDEX";
					try {
						await this.loadScript('https://yandex.ru/games/sdk/v2')						
					} catch (e) {
						alert(e);
					}
					help_obj.yandex();
					return;
				}

				//-----------CRAZYGAMES------------------------------------
				if (s.includes("crazygames")) {
					game_platform="CRAZYGAMES";					
					try {
						await this.loadScript('https://sdk.crazygames.com/crazygames-sdk-v1.js')					
					} catch (e) {
						alert(e);
					}
					help_obj.crazygames();										
					return;
				}
				
				
				//-----------ВКОНТАКТЕ------------------------------------
				if (s.includes("vk.com")) {
					game_platform="VK";
					
					try {
						await this.loadScript('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')				
					} catch (e) {
						alert(e);
					}
					help_obj.vk()					
					return;
				}


				//-----------ЛОКАЛЬНЫЙ СЕРВЕР--------------------------------
				if (s.includes("192.168")) {
					game_platform="debug";
					help_obj.debug();
					return;
				}


				//-----------НЕИЗВЕСТНОЕ ОКРУЖЕНИЕ---------------------------
				game_platform="unknown";
				help_obj.unknown();

			},

			get_random_name : function(e_str) {
				
				let rnd_names = ['Gamma','Жираф','Зебра','Тигр','Ослик','Мамонт','Волк','Лиса','Мышь','Сова','Hot','Енот','Кролик','Бизон','Super','ZigZag','Magik','Alpha','Beta','Foxy','Fazer','King','Kid','Rock'];
				let chars = '+0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
				if (e_str !== undefined) {
					
					let e_num1 = chars.indexOf(e_str[0]) + chars.indexOf(e_str[1]) + chars.indexOf(e_str[2]) +	chars.indexOf(e_str[3]);
					e_num1 = Math.abs(e_num1) % (rnd_names.length - 1);					
					let e_num2 = chars.indexOf(e_str[4]).toString()  + chars.indexOf(e_str[5]).toString()  + chars.indexOf(e_str[6]).toString() ;	
					e_num2 = e_num2.substring(0, 3);
					return rnd_names[e_num1] + e_num2;					
					
				} else {

					let rnd_num = irnd(0, rnd_names.length - 1);
					let rand_uid = irnd(0, 999999)+ 100;
					let name_postfix = rand_uid.toString().substring(0, 3);
					let name =	rnd_names[rnd_num] + name_postfix;				
					return name;
				}							

			},	

			get_random_name2 : function(e_str) {
				
				let rnd_names = ['Crazy','Monkey','Sky','Mad','Doom','Hash','Sway','Ace','Thor'];
				let chars = '+0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
				if (e_str !== undefined) {
					
					let e_num1 = chars.indexOf(e_str[0]) + chars.indexOf(e_str[1]) + chars.indexOf(e_str[2]) +	chars.indexOf(e_str[3]);
					e_num1 = Math.abs(e_num1) % (rnd_names.length - 1);					
					let e_num2 = chars.indexOf(e_str[4]).toString()  + chars.indexOf(e_str[5]).toString()  + chars.indexOf(e_str[6]).toString() ;	
					e_num2 = e_num2.substring(0, 3);
					return rnd_names[e_num1] + e_num2;					
					
				} else {

					let rnd_num = irnd(0, rnd_names.length - 1);
					let rand_uid = irnd(0, 999999)+ 100;
					let name_postfix = rand_uid.toString().substring(0, 3);
					let name =	rnd_names[rnd_num] + name_postfix;				
					return name;
				}						
			},	
			
			yandex: function() {

				
				if(typeof(YaGames)==='undefined')
				{
					help_obj.local();
				}
				else
				{
					//если sdk яндекса найден
					YaGames.init({}).then(ysdk => {

						//фиксируем SDK в глобальной переменной
						window.ysdk=ysdk;

						//запрашиваем данные игрока
						return ysdk.getPlayer();


					}).then((_player)=>{


						my_data.name 	= _player.getName();
						my_data.uid 	= _player.getUniqueID().replace(/\//g, "Z");
						my_data.pic_url = _player.getPhoto('medium');

						//если нету картинки то меняем ее на более прикольную
						if (my_data.pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
							my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/'+my_data.uid+'.svg';

						//console.log(`Получены данные игрока от яндекса:\nимя:${my_data.name}\nid:${my_data.uid}\npic_url:${my_data.pic_url}`);

						//если нет данных то создаем их
						if (my_data.name=="" || my_data.name=='')
							my_data.name = help_obj.get_random_name(my_data.uid);


						help_obj.process_results();

					}).catch((err)=>{

						//загружаем из локального хранилища если нет авторизации в яндексе
						help_obj.local();

					})
				}
			},

			vk: function() {

				vkBridge.send('VKWebAppInit').then(()=>{
					
					return vkBridge.send('VKWebAppGetUserInfo');
					
				}).then((e)=>{
					
					my_data.name 	= e.first_name + ' ' + e.last_name;
					my_data.uid 	= "vk"+e.id;
					my_data.pic_url = e.photo_100;

					//console.log(`Получены данные игрока от VB MINIAPP:\nимя:${my_data.name}\nid:${my_data.uid}\npic_url:${my_data.pic_url}`);
					help_obj.process_results();		
					
				}).catch(function(e){
					
					alert(e);
					
				});

			},

			get_cg_user_data : async function(event) {
				
				return new Promise(function(resolve, reject) {

					let crazysdk = window.CrazyGames.CrazySDK.getInstance();
					crazysdk.init();
					
					crazysdk.addEventListener('initialized', function(event) {	
						my_data.country_code = event.userInfo.countryCode;	
						resolve();					
					});
					
				});
				
			},

			crazygames : async function() {
				
				//переключаем язык на английский
				//LANG = 1;
				
				//запускаем сдк	и получаем информацию о стране			
				await help_obj.get_cg_user_data();
								
				//ищем в локальном хранилище
				let local_uid = null;
				try {
					local_uid = localStorage.getItem('uid');
				} catch (e) {
					console.log(e);
				}

				//здесь создаем нового игрока в локальном хранилище
				if (local_uid===undefined || local_uid===null) {

					//console.log("Создаем нового локального пользователя");
					let rnd_names=["Crazy","Monkey","Sky","Mad","Doom","Hash"];
					
					//console.log("Создаем нового локального пользователя");
					let rand_uid=Math.floor(Math.random() * 9999999);
					my_data.rating 		= 	1400;
					my_data.uid			=	"cg"+rand_uid;
					my_data.name 		=	 help_obj.get_random_name2(my_data.uid)+' (' + my_data.country_code +')';					
					my_data.pic_url		=	'https://avatars.dicebear.com/v2/male/'+irnd(10,10000)+'.svg';


					try {
						localStorage.setItem('uid',my_data.uid);
					} catch (e) {
						console.log(e);
					}
					
					help_obj.process_results();
				}
				else
				{
					//console.log(`Нашли айди в ЛХ (${local_uid}). Загружаем остальное из ФБ...`);
					
					my_data.uid = local_uid;	
					
					//запрашиваем мою информацию из бд или заносим в бд новые данные если игрока нет в бд
					firebase.database().ref("players/"+my_data.uid).once('value').then((snapshot) => {		
									
						var data=snapshot.val();
						
						//если на сервере нет таких данных
						if (data === null) {		
							//айди есть но данных нет, тогда заново их заносим
							my_data.rating 		= 	1400;
							my_data.name 		=	 help_obj.get_random_name2(my_data.uid)+' (' + my_data.country_code +')';					
							my_data.pic_url		=	'https://avatars.dicebear.com/v2/male/'+irnd(10,10000)+'.svg';
							
						} else {					
							
							my_data.pic_url = data.pic_url;
							my_data.name = data.name;							
						}
						
						help_obj.process_results();

					})	

				}			
	
			},

			debug: function() {

				let uid = prompt('Отладка. Введите ID', 100);

				my_data.name = my_data.uid = "debug" + uid;
				my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/'+my_data.uid+'.svg';

				help_obj.process_results();

			},

			local: function(repeat = 0) {

				//ищем в локальном хранилище
				let local_uid = localStorage.getItem('uid');

				//здесь создаем нового игрока в локальном хранилище
				if (local_uid===undefined || local_uid===null) {

					//console.log("Создаем нового локального пользователя");
					let rand_uid=Math.floor(Math.random() * 9999999);
					my_data.rating 		= 	1400;
					my_data.uid			=	"ls"+rand_uid;
					my_data.name 		=	 help_obj.get_random_name(my_data.uid);					
					my_data.pic_url		=	'https://avatars.dicebear.com/api/adventurer/'+my_data.uid+'.svg';

					try {
						localStorage.setItem('uid',my_data.uid);
					} catch (e) {
						console.log(e);
					}
					
					help_obj.process_results();
				}
				else
				{
					//console.log(`Нашли айди в ЛХ (${local_uid}). Загружаем остальное из ФБ...`);
					
					my_data.uid = local_uid;	
					
					//запрашиваем мою информацию из бд или заносим в бд новые данные если игрока нет в бд
					firebase.database().ref("players/"+my_data.uid).once('value').then((snapshot) => {		
									
						var data=snapshot.val();
						
						//если на сервере нет таких данных
						if (data === null) {
													
							//если повтоно нету данных то выводим предупреждение
							if (repeat === 1)
								alert('Какая-то ошибка');
							
							//console.log(`Нашли данные в ЛХ но не нашли в ФБ, повторный локальный запрос...`);	

							
							//повторно запускаем локальный поиск						
							localStorage.clear();
							help_obj.local(1);	
								
							
						} else {						
							
							my_data.pic_url = data.pic_url;
							my_data.name = data.name;
							help_obj.process_results();
						}

					})	

				}

			},

			unknown: function () {

				game_platform="unknown";
				alert("Неизвестная платформа! Кто Вы?")

				//загружаем из локального хранилища
				help_obj.local();
			},

			process_results: function() {


				//отображаем итоговые данные
				//console.log(`Итоговые данные:\nПлатформа:${game_platform}\nимя:${my_data.name}\nid:${my_data.uid}\npic_url:${my_data.pic_url}`);

				//обновляем базовые данные в файербейс так могло что-то поменяться
				firebase.database().ref("players/"+my_data.uid+"/name").set(my_data.name);
				firebase.database().ref("players/"+my_data.uid+"/pic_url").set(my_data.pic_url);
				//firebase.database().ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);
					
				//вызываем коллбэк
				resolve("ok");
			}
		}

		help_obj.init();

	});	
	
}

function resize() {
	
    const vpw = window.innerWidth;  // Width of the viewport
    const vph = window.innerHeight; // Height of the viewport
    let nvw; // New game width
    let nvh; // New game height

    if (vph / vpw < M_HEIGHT / M_WIDTH) {
      nvh = vph;
      nvw = (nvh * M_WIDTH) / M_HEIGHT;
    } else {
      nvw = vpw;
      nvh = (nvw * M_HEIGHT) / M_WIDTH;
    }
    app.renderer.resize(nvw, nvh);
    app.stage.scale.set(nvw / M_WIDTH, nvh / M_HEIGHT);
}

function set_state(params) {

	if (params.state!==undefined)
		state=params.state;

	if (params.hidden!==undefined)
		h_state=+params.hidden;

	let small_opp_id="";
	if (opp_data.uid!==undefined)
		small_opp_id=opp_data.uid.substring(0,10);

	firebase.database().ref(room_name+"/"+my_data.uid).set({state:state, name:my_data.name, rating : my_data.rating, hidden:h_state, opp_id : small_opp_id});

}

function vis_change() {

		if (document.hidden === true)		
			hidden_state_start = Date.now();			
		
		set_state({hidden : document.hidden});
		
}

async function check_daily_reward (last_seen_ts) {
	
	
	//вычисляем номер дня последнего посещения
	let last_seen_day = new Date(last_seen_ts).getDate();		
	
	//считываем текущее время
	await firebase.database().ref("server_time").set(firebase.database.ServerValue.TIMESTAMP);

	//определяем текущий день
	let _cur_ts = await firebase.database().ref("server_time").once('value');
	let cur_ts = _cur_ts.val();
	let cur_day = new Date(cur_ts).getDate();
	
	//обновляем время последнего посещения
	firebase.database().ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);
	if (cur_day !== last_seen_day)
	{		
		my_data.money++;
		firebase.database().ref("players/"+my_data.uid + "/money").set(my_data.money);	
		
		sound.play('daily_reward');

		objects.dr_title.text=['Ежедневный бонус!\n+1$','Daily reward!\n+1$'][LANG];
		await anim2.add(objects.dr_cont,{alpha:[0, 1]}, true, 1,'linear');
		await new Promise((resolve, reject) => setTimeout(resolve, 1000));
		anim2.add(objects.dr_cont,{alpha:[1, 0]}, false, 1,'linear');
		
	}

}

async function init_game_env(l) {

	//if (l===1) LANG = 1;
	
	let cards=[	{value_num:12, suit_txt: 's'},
				{value_num:11, suit_txt: 'c'},
				{value_num:11, suit_txt: 's'},
				{value_num:7, suit_txt: 'c'},
				{value_num:8, suit_txt: 'h'},
				{value_num:13, suit_txt: 'h'},
				{value_num:12, suit_txt: 'd'}];
	
	var res = hand_check.check(cards)
	console.log(res)
	//return

	//return;
	

	await load_resources();
		
	//убираем загрузочные данные
	document.getElementById("m_bar").outerHTML = "";
	document.getElementById("m_progress").outerHTML = "";

	//короткое обращение к ресурсам
	gres=game_res.resources;

	//инициируем файербейс
	if (firebase.apps.length===0) {
		firebase.initializeApp({			
			apiKey: "AIzaSyDEQoP_xNrecObpO0sHPOisMsu01JCmP6Q",
			authDomain: "poker-cd9ed.firebaseapp.com",
			databaseURL: "https://poker-cd9ed-default-rtdb.europe-west1.firebasedatabase.app",
			projectId: "poker-cd9ed",
			storageBucket: "poker-cd9ed.appspot.com",
			messagingSenderId: "721039342577",
			appId: "1:721039342577:web:808922ef505e8dc148e250"
		});
	}

	//создаем приложение пикси и добавляем тень
	app = new PIXI.Application({width:M_WIDTH, height:M_HEIGHT,antialias:true});
	document.body.appendChild(app.view).style["boxShadow"] = "0 0 15px #000000";
	
	//изменение размера окна
	resize();
	window.addEventListener("resize", resize);

    //создаем спрайты и массивы спрайтов и запускаем первую часть кода
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)

        switch (obj_class) {
        case "sprite":
            objects[obj_name] = new PIXI.Sprite(game_res.resources[obj_name].texture);
            eval(load_list[i].code0);
            break;

        case "block":
            eval(load_list[i].code0);
            break;
			
        case "asprite":
			objects[obj_name] = gres[obj_name].animation;
            eval(load_list[i].code0);
            break;
			
        case "cont":
            eval(load_list[i].code0);
            break;

        case "array":
			var a_size=load_list[i].size;
			objects[obj_name]=[];
			for (var n=0;n<a_size;n++)
				eval(load_list[i].code0);
            break;
        }
    }

    //обрабатываем вторую часть кода в объектах
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)
				
        switch (obj_class) {
        case "sprite":
            eval(load_list[i].code1);
            break;

        case "block":
            eval(load_list[i].code1);
            break;
			
        case "asprite":	
			eval(load_list[i].code1);
            break;
			
        case "cont":	
			eval(load_list[i].code1);
            break;

        case "array":
			var a_size=load_list[i].size;
				for (var n=0;n<a_size;n++)
					eval(load_list[i].code1);	;
            break;
        }
    }

	//запускаем главный цикл
	main_loop();


	//анимация лупы
	some_process.loup_anim=function() {
		objects.id_loup.x=20*Math.sin(game_tick*8)+90;
		objects.id_loup.y=20*Math.cos(game_tick*8)+150;
	}


	//получаем данные авторизации игрока
	try {
		await auth();		
	} catch(e) {
		alert('Ошибка авторизации ' + e)		
	}


	//загружаем аватарку игрока
	let loader=new PIXI.Loader();
	await new Promise(function(resolve, reject) {		
		loader.add("my_avatar", my_data.pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});
		loader.load(function(l,r) {	resolve(l)});
	});

	//устанавливаем фотки в попап и другие карточки
	objects.id_avatar.texture = objects.my_avatar.texture = loader.resources.my_avatar.texture;

	//устанавлием мое имя в карточки
	make_text(objects.id_name,my_data.name,150);
	make_text(objects.my_card_name,my_data.name,150);
	
	//событие ролика мыши в карточном меню
	window.addEventListener("wheel", event => cards_menu.wheel_event(Math.sign(event.deltaY)));
	
	window.addEventListener('keydown', function(event) {
	  feedback.key_down(event.key)
	});

	
	//загружаем остальные данные
	let _other_data = await firebase.database().ref("players/"+my_data.uid).once('value');
	let other_data = _other_data.val();
	
	//это защита от неправильных данных
	other_data===null ?
		my_data.rating=100 :
		my_data.rating = other_data.rating || 100;

	other_data===null ?
		my_data.games = 0 :
		my_data.games = other_data.games || 0;
		
	other_data===null ?
		my_data.level = 0 :
		my_data.level = other_data.level || 0;
		
			
	//номер комнаты
	if (my_data.rating >= 1500)
		room_name= 'states2';			
	else
		room_name= 'states';			

	//устанавливаем рейтинг в попап
	objects.id_rating.text=objects.my_card_rating.text=my_data.rating;

	//обновляем почтовый ящик
	firebase.database().ref("inbox/"+my_data.uid).set({sender:"-",message:"-",tm:"-",data:{x1:0,y1:0,x2:0,y2:0,board_state:0}});

	//подписываемся на новые сообщения
	firebase.database().ref("inbox/"+my_data.uid).on('value', (snapshot) => { process_new_message(snapshot.val());});
	
	//обновляем базовые данные в файербейс так могло что-то поменяться
	firebase.database().ref("players/"+my_data.uid+"/name").set(my_data.name);
	firebase.database().ref("players/"+my_data.uid+"/pic_url").set(my_data.pic_url);				
	firebase.database().ref("players/"+my_data.uid+"/rating").set(my_data.rating);
	firebase.database().ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);
	
	//устанавливаем мой статус в онлайн
	set_state({state : 'o'});

	//отключение от игры и удаление не нужного
	firebase.database().ref("inbox/"+my_data.uid).onDisconnect().remove();
	firebase.database().ref(room_name+"/"+my_data.uid).onDisconnect().remove();

	//это событие когда меняется видимость приложения
	document.addEventListener("visibilitychange", vis_change);

	//keep-alive сервис
	setInterval(function()	{keep_alive()}, 40000);


	//ждем одну секунду
	await new Promise((resolve, reject) => {setTimeout(resolve, 1000);});

	some_process.loup_anim = function(){};

	anim2.add(objects.id_cont,{y:[objects.id_cont.sy, -200]}, false, 0.5,'easeInBack');
	
	//контроль за присутсвием
	var connected_control = firebase.database().ref(".info/connected");
	connected_control.on("value", (snap) => {
	  if (snap.val() === true) {
		connected = 1;
	  } else {
		connected = 0;
	  }
	});

	//показыаем основное меню
	main_menu.activate();


	
}

async function load_resources() {

	//это нужно удалить потом
	/*document.body.innerHTML = "Привет!\nДобавляем в игру некоторые улучшения))\nЗайдите через 40 минут.";
	document.body.style.fontSize="24px";
	document.body.style.color = "red";
	return;*/


	let git_src="https://akukamil.github.io/poker/"
	///git_src=""

	game_res=new PIXI.Loader();
	
	
	game_res.add("m2_font", git_src+"fonts/MS_Comic_Sans/font.fnt");

	game_res.add('receive_sticker',git_src+'sounds/receive_sticker.mp3');
	game_res.add('message',git_src+'sounds/message.mp3');
	game_res.add('lose',git_src+'sounds/lose.mp3');
	game_res.add('win',git_src+'sounds/win.mp3');
	game_res.add('click',git_src+'sounds/click.mp3');
	game_res.add('close',git_src+'sounds/close.mp3');
	game_res.add('locked',git_src+'sounds/locked.mp3');
	game_res.add('clock',git_src+'sounds/clock.mp3');
	game_res.add('card',git_src+'sounds/card2.mp3');
	game_res.add('card_take',git_src+'sounds/card.mp3');
	game_res.add('confirm_dialog',git_src+'sounds/confirm_dialog.mp3');
	game_res.add('move',git_src+'sounds/move.mp3');
	game_res.add('done',git_src+'sounds/done.mp3');
	game_res.add('razdacha',git_src+'sounds/razdacha.mp3');
	game_res.add('card_open',git_src+'sounds/card_open.mp3');
	game_res.add('inc_card',git_src+'sounds/inc_card.mp3');
	game_res.add('take',git_src+'sounds/take.mp3');
	game_res.add('dialog',git_src+'sounds/dialog.mp3');
	game_res.add('plus_minus_bet',git_src+'sounds/plus_minus_bet.mp3');
	game_res.add('keypress',git_src+'sounds/keypress.mp3');
	
    //добавляем из листа загрузки
    for (var i = 0; i < load_list.length; i++) {
        if (load_list[i].class === "sprite" || load_list[i].class === "image" )
            game_res.add(load_list[i].name, git_src+"res/" + load_list[i].name + "." +  load_list[i].image_format);
        if (load_list[i].class === "asprite" )
            game_res.add(load_list[i].name, git_src+"gifs/" + load_list[i].res_name);
	}

	//добавляем текстуры стикеров
	for (var i=0;i<16;i++)
		game_res.add("sticker_texture_"+i, git_src+"stickers/"+i+".png");

	game_res.onProgress.add(progress);
	function progress(loader, resource) {
		document.getElementById("m_bar").style.width =  Math.round(loader.progress)+"%";
	}
	
	await new Promise((resolve, reject)=> game_res.load(resolve))

}

function main_loop() {


	game_tick+=0.016666666;
	anim2.process();
	
	//обрабатываем минипроцессы
	for (let key in some_process)
		some_process[key]();	
	
	requestAnimationFrame(main_loop);
	
	
}

