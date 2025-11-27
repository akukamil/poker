var M_WIDTH=800, M_HEIGHT=450;
var app, assets={},yndx_payments=0, app_start_time=0, game,SERVER_TM, objects={}, LANG = 0, state="", game_tick = 0, game_id = 0, connected = 1, client_id =0, h_state = 0, game_platform = "", game_name='poker', hidden_state_start=0,fbs=null, pending_player='', opponent={}, my_data={opp_id : ''},opp_data={}, some_process={},git_src='', ME=0,OPP=1,WIN=1,DRAW=0,LOSE=-1,NOSYNC=2,turn=0,BET=0,BIG_BLIND=2;
const codes = [65,73,122,97,83,121,67,104,71,73,82,53,87,110,119,51,87,77,97,116,55,77,113,79,68,95,101,72,81,75,107,84,51,65,65,98,85,69];
const cards_data=[["h",0,2],["h",0,3],["h",0,4],["h",0,5],["h",0,6],["h",0,7],["h",0,8],["h",0,9],["h",0,10],["h",0,11],["h",0,12],["h",0,13],["h",0,14],["d",1,2],["d",1,3],["d",1,4],["d",1,5],["d",1,6],["d",1,7],["d",1,8],["d",1,9],["d",1,10],["d",1,11],["d",1,12],["d",1,13],["d",1,14],["s",2,2],["s",2,3],["s",2,4],["s",2,5],["s",2,6],["s",2,7],["s",2,8],["s",2,9],["s",2,10],["s",2,11],["s",2,12],["s",2,13],["s",2,14],["c",3,2],["c",3,3],["c",3,4],["c",3,5],["c",3,6],["c",3,7],["c",3,8],["c",3,9],["c",3,10],["c",3,11],["c",3,12],["c",3,13],["c",3,14]]
const suit_num_to_txt = ['h','d','s','c'];
const value_num_to_txt = ['0','1','2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const comb_to_text = {HIGH_CARD : ['СТ.КАРТА','HIGH CARD'],PAIR : ['ПАРА','PAIR'],TWO_PAIRS : ['ДВЕ ПАРЫ','TWO PAIRS'],SET : ['ТРОЙКА (СЕТ)','THREE OF A KIND'],STRAIGHT : ['СТРИТ','STRAIGHT'],FLUSH : ['ФЛЭШ','FLUSH'],FULL_HOUSE : ['ФУЛ-ХАУС','FULL HOUSE'],KARE : ['КАРЕ','FOUR OF A KIND'],STRAIGHT_FLUSH : ['СТРИТ ФЛЭШ','STRAIGHT FLUSH'],ROYAL_FLUSH : ['ФЛЭШ-РОЯЛЬ','ROYAL FLUSH']};
const transl_action={CHECK:['ЧЕК','CHECK'],RAISE:['РЕЙЗ','RAISE'],CALL:['КОЛЛ','CALL'],FOLD:['ФОЛД','FOLD'],BET:['БЭТ','BET']};
let table_id='table1';
let cards_suit_texture=''
const ante_data={'table1':20,'table2':30,'table3':40,'table4':50};
const enter_data={'table1':25000,'table2':50000,'table3':10000,'table4':20000};
fbs_once=async function(path){
	const info=await fbs.ref(path).get();
	return info.val();	
}

irnd = function(min,max) {	
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

formatNumber=function(num) {

    if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + 'b';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'm';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'k';
    } else {
        return num.toString();
    }
}

nameToColor=(name)=>{
	  // Create a hash from the name
	  let hash = 0;
	  for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash; // Convert to 32bit integer
	  }

	  // Generate a color from the hash
	  let color = ((hash >> 24) & 0xFF).toString(16) +
				  ((hash >> 16) & 0xFF).toString(16) +
				  ((hash >> 8) & 0xFF).toString(16) +
				  (hash & 0xFF).toString(16);

	  // Ensure the color is 6 characters long
	  color = ('000000' + color).slice(-6);

	  // Convert the hex color to an RGB value
	  let r = parseInt(color.slice(0, 2), 16);
	  let g = parseInt(color.slice(2, 4), 16);
	  let b = parseInt(color.slice(4, 6), 16);

	  // Ensure the color is bright enough for a black background
	  // by normalizing the brightness.
	  if ((r * 0.299 + g * 0.587 + b * 0.114) < 128) {
		r = Math.min(r + 128, 255);
		g = Math.min(g + 128, 255);
		b = Math.min(b + 128, 255);
	  }

	  return (r << 16) + (g << 8) + b;
}

class lb_player_card_class extends PIXI.Container{

	constructor(x,y,place) {
		super();

		this.bcg=new PIXI.Sprite(assets.lb_player_card_bcg);
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
		this.avatar.y=13;
		this.avatar.width=this.avatar.height=45;


		this.name=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.name.tint=0x55ffaa;
		this.name.x=105;
		this.name.y=22;


		this.rating=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.rating.x=350;
		this.rating.anchor.set(1,0);
		this.rating.tint=0xffff55;
		this.rating.y=22;

		this.addChild(this.bcg,this.place, this.avatar, this.name, this.rating);
	}


}

class table_chat_record_class extends PIXI.Container {
	
	constructor() {
		
		super();	
		this.resolver=0;
		this.text=new PIXI.BitmapText('***', {fontName: 'mfont',fontSize:23,lineSpacing:45}); 
		this.text.tint=0x55bbdd;
		this.text.maxWidth=290;
		
		this.name_text=new PIXI.BitmapText('***', {fontName: 'mfont',fontSize: 23}); 
		this.name_text.tint=0xbbff00;
		
		this.visible=false;
		this.addChild(this.text,this.name_text)
		
	}
	
	async set(name,text,color){
		
		sound.play('inst_msg');
		name=name.substr(0,7);
		this.text.text=name+': '+text;
		this.name_text.text=name+':';
		this.name_text.tint=color||0xFFFFFF;	
		this.visible=true;
	
	}	
	
	hide(){
		
		
		
	}
	
}

class chat_record_class extends PIXI.Container {
	
	constructor() {
		
		super();
		
		this.tm=0;
		this.index=0;
		this.uid='';		
		

		
		this.avatar = new PIXI.Graphics();
		this.avatar.w=50;
		this.avatar.h=50;
		this.avatar.x=30;
		this.avatar.y=13;		
				
		this.avatar_bcg = new PIXI.Sprite(assets.chat_avatar_bcg_img);
		this.avatar_bcg.width=70;
		this.avatar_bcg.height=70;
		this.avatar_bcg.x=this.avatar.x-10;
		this.avatar_bcg.y=this.avatar.y-10;
		this.avatar_bcg.interactive=true;
		this.avatar_bcg.pointerdown=()=>chat.avatar_down(this);		
					
		this.avatar_frame = new PIXI.Sprite(assets.chat_avatar_frame_img);
		this.avatar_frame.width=70;
		this.avatar_frame.height=70;
		this.avatar_frame.x=this.avatar.x-10;
		this.avatar_frame.y=this.avatar.y-10;
		
		this.name = new PIXI.BitmapText('Имя Фамил', {fontName: 'mfont',fontSize: 17});
		this.name.anchor.set(0,0.5);
		this.name.x=this.avatar.x+72;
		this.name.y=this.avatar.y-1;	
		this.name.tint=0xFBE5D6;
		
		this.gif=new PIXI.Sprite();
		this.gif.x=this.avatar.x+65;	
		this.gif.y=22;
		
		this.gif_bcg=new PIXI.Graphics();
		this.gif_bcg.beginFill(0x111111)
		this.gif_bcg.drawRect(0,0,1,1);
		this.gif_bcg.x=this.gif.x+3;	
		this.gif_bcg.y=this.gif.y+3;
		this.gif_bcg.alpha=0.5;
		
		
				
		this.msg_bcg = new PIXI.NineSlicePlane(assets.msg_bcg,50,18,50,28);
		//this.msg_bcg.width=160;
		//this.msg_bcg.height=65;	
		this.msg_bcg.scale_xy=0.66666;		
		this.msg_bcg.x=this.avatar.x+45;	
		this.msg_bcg.y=this.avatar.y+2;
		
		this.msg = new PIXI.BitmapText('Имя Фамил', {fontName: 'mfont',fontSize: 19,lineSpacing:55,align: 'left'}); 
		this.msg.x=this.avatar.x+75;
		this.msg.y=this.avatar.y+30;
		this.msg.maxWidth=450;
		this.msg.anchor.set(0,0.5);
		this.msg.tint = 0xffffff;
		
		this.msg_tm = new PIXI.BitmapText('28.11.22 12:31', {fontName: 'mfont',fontSize: 15}); 		
		this.msg_tm.tint=0x999999;
		this.msg_tm.anchor.set(1,0);
		
		this.visible = false;
		this.addChild(this.msg_bcg,this.gif_bcg,this.gif,this.avatar_bcg,this.avatar,this.avatar_frame,this.name,this.msg,this.msg_tm);
		
	}
				
	async update_avatar(uid, tar_sprite) {		
	
		//определяем pic_url
		await players_cache.update(uid);
		await players_cache.update_avatar(uid);
		tar_sprite.set_texture(players_cache.players[uid].texture);	
	}
	
	async set(msg_data) {
						
		//получаем pic_url из фб
		this.avatar.set_texture(PIXI.Texture.WHITE);
				
		if (msg_data.uid==='admin'){
			this.msg_bcg.tint=0x55ff55;
			await this.update_avatar('BOT', this.avatar);
		}else{
			this.msg_bcg.tint=0xffffff;
			await this.update_avatar(msg_data.uid, this.avatar);
		}		

		this.uid=msg_data.uid;
		this.tm = msg_data.tm;			
		this.index = msg_data.index;		
		
		this.name.set2(msg_data.name,150);
		this.name.tint=nameToColor(msg_data.name);
		this.msg_tm.text = new Date(msg_data.tm).toLocaleString();
		this.msg.text=msg_data.msg;
		this.visible = true;
		
		if (msg_data.msg.startsWith('GIF')){			
			
			const mp4BaseT=await new Promise((resolve, reject)=>{
				const baseTexture = PIXI.BaseTexture.from('https://akukamil.github.io/common/gifs/'+msg_data.msg+'.mp4');
				if (baseTexture.width>1) resolve(baseTexture);
				baseTexture.on('loaded', () => resolve(baseTexture));
				baseTexture.on('error', (error) => resolve(null));
			});
			
			if (!mp4BaseT) {
				this.visible=false;
				return 0;
			}
			
			mp4BaseT.resource.source.play();
			mp4BaseT.resource.source.loop=true;
			
			this.gif.texture=PIXI.Texture.from(mp4BaseT);
			this.gif.visible=true;	
			const aspect_ratio=mp4BaseT.width/mp4BaseT.height;
			this.gif.height=90;
			this.gif.width=this.gif.height*aspect_ratio;
			this.msg_bcg.visible=false;
			this.msg.visible=false;
			this.msg_tm.anchor.set(0,0);
			this.msg_tm.y=this.gif.height+9;
			this.msg_tm.x=this.gif.width+102;
			
			this.gif_bcg.visible=true;
			this.gif_bcg.height=this.gif.height;
			this.gif_bcg.width=	this.gif.width;
			return this.gif.height+30;
			
		}else{
			
			this.gif_bcg.visible=false;
			this.gif.visible=false;	
			this.msg_bcg.visible=true;
			this.msg.visible=true;
			
			//бэкграунд сообщения в зависимости от длины
			const msg_bcg_width=Math.max(this.msg.width,100)+100;			
			this.msg_bcg.width=msg_bcg_width*1.5;				
					
			if (msg_bcg_width>300){
				this.msg_tm.anchor.set(1,0);
				this.msg_tm.y=this.avatar.y+52;
				this.msg_tm.x=msg_bcg_width+55;
			}else{
				this.msg_tm.anchor.set(0,0);
				this.msg_tm.y=this.avatar.y+37;
				this.msg_tm.x=msg_bcg_width+62;
			}	
			
			return 70;
		}		
	}		

}

class playing_cards_class extends PIXI.Container {
	
	constructor() {
		
		super();
		
		this.opened=0;
		this.card_index=0;
		this.value_num = 0;
		this.value_txt = '';
		
		this.suit_num = 0;
		this.suit_txt = '';
		
		this.visible = false;
					
		this.bcg = new PIXI.Sprite(assets.pcard_bcg);
		this.bcg.anchor.set(0.5,0.5);	
		this.bcg.width=90;
		this.bcg.height=120;
							
		this.suit_img = new PIXI.Sprite();
		this.suit_img.anchor.set(0.5,0.5);
		this.suit_img.width=90;
		this.suit_img.height=120;
		
		this.t_value = new PIXI.BitmapText('', {fontName: 'cards_font',fontSize: 55});
		this.t_value.anchor.set(0.5,0.5);
		this.t_value.x=0;
		this.t_value.y=-22;
		this.t_value.tint=0x000000;
						
						
		this.addChild(this.bcg, this.suit_img, this.t_value);
	}	
	
	set_shirt () {
		//return
		this.opened=0;
		this.t_value.visible = false;
		this.suit_img.texture = cards_suit_texture;		
		
	}
		
	async open (card_index) {
		
		sound.play('card_open');
		
		this.opened=1;
		this.card_index=card_index;
		
		this.value_num = cards_data[card_index][2];
		this.suit_num = cards_data[card_index][1];
		
		//текстовые значения
		this.value_txt = value_num_to_txt[this.value_num];
		this.suit_txt = suit_num_to_txt[this.suit_num];
		
		if (this.suit_txt === 'h' || this.suit_txt === 'd')
			this.t_value.tint = 0xff0000;
		else
			this.t_value.tint = 0x2D3133;
		
		this.t_value.text = this.value_txt;	
				
		await anim3.add(this,{scale_x:[1,0,'linear']}, false, 0.2);		
		this.t_value.visible = true;
		this.suit_img.texture = assets[this.suit_txt + '_bcg'];
		await anim3.add(this,{scale_x:[0, 1,'linear']}, true, 0.2);	
		
	}	
		
}

class action_info_class extends PIXI.Container{
	
	constructor() {
		
		super();
		this.bcg=new PIXI.Sprite(assets.action_bcg);
		this.bcg.width=140;		
		this.bcg.height=50;
		this.bcg.anchor.set(0.5,0.5);
		
		this.t_info=new PIXI.BitmapText('9', {fontName: 'mfont', fontSize :25});
		this.t_info.anchor.set(0.5,0.5);
		this.t_info.tint=0x333333;		
		this.addChild(this.bcg,this.t_info);
	}	
	
}

class player_card_class extends PIXI.Container {
		
	constructor(x,y) {
		
		super();
		
		this.stat=0;
		this.place=0;
		this.uid=0;
		this.card_id=1;
		this.show_fold=1;
		
		this.bcg=new PIXI.Sprite(assets.card1);
		this.bcg.width=150;
		this.bcg.height=120;
		this.bcg.visible=true;
		this.bcg.interactive=true;
		this.bcg.buttonMode=true;
		this.bcg.pointerdown=this.card_down.bind(this);
		
		this.hl=new PIXI.Sprite(assets.bcg_hl);
		this.hl.width=150;
		this.hl.height=120;
		this.hl.visible=false;		
		
		this.avatar=new PIXI.Graphics();
		this.avatar.w=this.avatar.h=50;
		this.avatar.x=15;
		this.avatar.y=35;
		
		this.avatar_frame=new PIXI.Sprite(assets.avatar_frame);
		this.avatar_frame.width=this.avatar_frame.height=70;
		this.avatar_frame.x=5;
		this.avatar_frame.y=25;
				
		this.name=new PIXI.BitmapText('13525', {fontName: 'mfont', fontSize :22});
		this.name.anchor.set(0.5,0.5);
		this.name.x=70;
		this.name.y=23;
		this.name.tint=0xFFFF00;						
						
		this.chip_icon=new PIXI.Sprite(assets.chip_img);
		this.chip_icon.x=100;
		this.chip_icon.y=96;
		this.chip_icon.width=25;
		this.chip_icon.height=25;
		this.chip_icon.anchor.set(0.5,0.5);								
						
		this.t_rating=new PIXI.BitmapText('---', {fontName: 'mfont', fontSize :24});
		this.t_rating.x=120;
		this.t_rating.y=95;
		this.t_rating.tint=0xffffff;
		this.t_rating.anchor.set(1,0.5);
		
		this.t_country=new PIXI.BitmapText('---', {fontName: 'mfont', fontSize :20});
		this.t_country.x=20;
		this.t_country.y=95;
		this.t_country.tint=0x88ccff;
		this.t_country.anchor.set(0,0.5);
		
		this.my_card_icon=new PIXI.Sprite(assets.my_card_icon_img);
		this.my_card_icon.width=this.my_card_icon.height=40;
		this.my_card_icon.x=5;
		this.my_card_icon.y=24;
		this.my_card_icon.visible=true;
					
		this.card0=new mini_cards_calss();
		this.card0.x=84;
		this.card0.y=60;
		this.card0.angle=0;
		
		this.card1=new mini_cards_calss();
		this.card1.x=116;
		this.card1.y=60;
		this.card1.angle=0;		
						
		this.t_comb=new PIXI.BitmapText('', {fontName: 'mfont', fontSize :20,align:'center',lineSpacing:45});
		this.t_comb.x=75;
		this.t_comb.y=110;
		this.t_comb.tint=0xFFD966;
		this.t_comb.anchor.set(0.5,0);
		this.t_comb.maxWidth=160
		this.t_comb.visible=false;	

		this.t_won=new PIXI.BitmapText('', {fontName: 'mfont', fontSize :28,align:'center'});
		this.t_won.x=75;
		this.t_won.y=this.t_won.sy=155;
		this.t_won.tint=0xffffff;
		this.t_won.anchor.set(0.5,0.5);
		this.t_won.visible=false;	
				
		this.added_chips=0;
		this.hand_value=0;
		this.in_game=0;
		this.bank=0;
		this.place=-1;
		this.my_pot=0;
		this.rating=0;		
		this.anim_on=0;
		this.sticker_tm=0;
		this.sticker_on=0;
		
		this.prv_anim_tm=0;
		this.anims=[];
		for (let i=0;i<5;i++){
			const spr=new PIXI.Sprite();
			spr.anchor.set(0.5,0.5);	
			spr.visible=false;
			this.anims.push(spr);			
		}
			
			
		this.visible=false;
		
		this.addChild(this.bcg,this.hl,this.avatar,this.avatar_frame,this.card0,this.card1,this.name,this.t_country,this.chip_icon,this.t_rating,this.t_comb,this.t_won,this.my_card_icon,...this.anims);
		
	}	
	
	add_info(info){		
		this.t_comb.text=info;
		anim3.add(this.t_comb,{alpha:[1,0,'linear']}, true, 3);				
	}
	
	async show_income(income){	
		this.t_won.text='+'+income;
		anim3.add(this.t_won,{y:[this.t_won.sy-50,this.t_won.sy,'linear'],alpha:[0,1,'linear']}, true, 0.25,false);
		await new Promise((resolve, reject) => {setTimeout(resolve, 8000);});
		anim3.add(this.t_won,{y:[this.t_won.y,this.t_won.sy-50,'linear'],alpha:[1,0,'linear']}, false, 0.25,false);
	}
	
	show_sticker(sticker){
		
		this.clear_anim();
		this.sticker_tm=game_tick;
		this.sticker_on=1;
		
		switch (sticker){
			
			case 1: //heart
				sound.play('magic');
				this.anim_on=1;
				this.anim_texture=assets.heart;
			break;		
			
			case 2: //cat
				sound.play('magic');
				this.anim_on=1;
				this.anim_texture=assets.cat;
			break;
			
			case 3: //stars
				sound.play('magic');
				this.anim_on=1;
				this.anim_texture=assets.star;
			break;
			
			case 4: //tomato
				sound.play('tomato_snd');
				this.add_tomato_emotion();
			break;
			
			case 5: //egg
				sound.play('egg_snd');
				this.add_egg_emotion();
			break;
			
			case 6: //brick
				sound.play('brick_snd');
				this.add_brick_emotion();
			break;
			
		}		
		
	}
	
	process_anim(){		
	
		if (this.sticker_on){
			if (game_tick-this.sticker_tm>10)
				this.clear_anim();			
		}
	
				
		if (!this.anim_on) return;

		if (game_tick>this.prv_anim_tm+1.5){
			this.prv_anim_tm=game_tick;
			const free_anim_spr=this.anims.find(a=>a.visible===false);
			free_anim_spr.texture=this.anim_texture;
			free_anim_spr.x=75+irnd(-20,20);
			free_anim_spr.y=60+irnd(-20,20);
			free_anim_spr.tint=Math.floor((Math.random()*0.5+0.5) * 0xFFFFFF);
			anim3.add(free_anim_spr,{alpha:[1, 0.5,'linear'],scale_xy:[0.2,0.9,'linear'],angle:[0,irnd(-20,20),'linear']}, false, 4,false);
		}		
	}	
	
	add_egg_emotion(){
		
		const splash=this.anims[0];
		const egg_with_shell=this.anims[1];
		
		splash.texture=assets.egg_splash;
		splash.x=75;
		splash.y=60;
		splash.tint=0xffffff;
		
		egg_with_shell.texture=assets.egg_with_shell;
		egg_with_shell.x=75;
		egg_with_shell.y=70;
		egg_with_shell.width=100;
		egg_with_shell.height=100;
		egg_with_shell.visible=true;
		egg_with_shell.tint=0xffffff;
		
		anim3.add(splash,{alpha:[0,1,'linear'],scale_xy:[0,0.666,'linear']}, true, 0.1);	
		
	}
	
	add_tomato_emotion(){			
		
		const splash=this.anims[0];
		const tomato=this.anims[1];
		
		splash.texture=assets.tomato_splash;
		splash.x=75;
		splash.y=60;
		splash.tint=0xffffff;
		
		tomato.texture=assets.tomato;
		tomato.x=75;
		tomato.y=60;
		tomato.width=70;
		tomato.height=70;
		tomato.visible=true;
		tomato.tint=0xffffff;
		
		anim3.add(splash,{alpha:[0,1,'linear'],scale_xy:[0,0.666,'linear']}, true, 0.1);			
		
	}
	
	add_brick_emotion(){
						
		const pic=this.anims[0];
		pic.x=75;
		pic.y=60;
		pic.width=150;
		pic.height=120;
		pic.tint=0xffffff;
		pic.texture=assets.brick_smash;
		anim3.add(pic,{alpha:[0,1,'linear']}, true, 0.1);
		
	}
		
	show_action(event){		
		
		const action=event.data;
				
		objects.action_info.x=this.x+70;
		if (this.t_comb.visible)
			objects.action_info.y=this.y+157;
		else
			objects.action_info.y=this.y+130;
		objects.action_info.t_info.text=transl_action[event.data][LANG];
				
		let in_money=event.chips||event.bet_raise;
		if (event.bet_raise!=null)
			in_money=event.bet_raise;		
		if (event.chips!=null)
			in_money=event.chips;
		
		if(action==='FOLD') in_money=0;
		
		if (in_money) objects.action_info.t_info.text+=' '+in_money;			
		anim3.add(objects.action_info,{alpha:[0,1,'easeBridge']}, false, 3,false);		
	
		if (this.uid!==my_data.uid){
			if(action==='CHECK')
				sound.play('check')
			if(action==='CALL')
				sound.play('call')			
			if(action==='BET'||action==='RAISE' )
				sound.play('raise')	
			if(action==='FOLD' )
				sound.play('fold')	
		}

		
	}
			
	set_cards(cards){
		this.card0.card_index=cards[0];
		this.card1.card_index=cards[1];		
	}
	
	set_uid(uid){
		
		
		
	}
	
	set_on_turn(on){
		
		if(on){
			this.run_timer();
			this.hl.visible=true;
			//this.name.tint=0xFFFF00;
		}else{			
			this.hl.visible=false;	
			//this.name.tint=0x666600;
		}		
	}
	
	set_rating(rating){
		
		if (rating>=1000000){
			this.chip_icon.tint=0xFFD700;
			this.t_rating.tint=0xFFD700;
		}else{
			this.chip_icon.tint=0xFFFFFF;
			this.t_rating.tint=0xFFFFFF;
		}
		
		this.rating=rating;
		this.t_rating.text=formatNumber(rating);		
		this.chip_icon.x=this.t_rating.x-this.t_rating.width-10;
	}
	
	change_balance(amount,reason){
				
		if(!amount) return;
		
		this.set_rating(this.rating+amount);	
		
		if(this.uid===my_data.uid){		
		
			game.update_my_balance_info(amount);			
			game.change_my_balance(amount,reason);		
			game.update_pending();

		}		
	}
	
	clear_anim(){
		
		this.anim_on=0;
		this.sticker_on=0;
		this.anims.forEach(a=>{
			if (a.visible)
				anim3.add(a,{alpha:[a.alpha, 0,'linear']}, false, 0.2);	
		});		
	}
	
	async update_data(){	
	
		let player_data=players_cache.players?.[this.uid];
		const name=players_cache.players?.[this.uid]?.name;
		const pic_url=players_cache.players?.[this.uid]?.pic_url;
		const card_id=players_cache.players?.[this.uid]?.card_id;
		
		//рейтинг всегда обновляем
		const rating=await fbs_once('players/'+this.uid+'/PUB/rating');		
		
		this.set_rating(rating);
		
		//console.log('Текущие данные',this.uid,player_data,name,pic_url,card_id)
		if(!player_data||!name||!pic_url||!card_id){
					
			player_data=await fbs_once('players/'+this.uid+'/PUB');
			console.log('загружены данные из фб',this.uid)
			if(!player_data) return;			
			
			//обновляем кэше
			if (!players_cache.players[this.uid]) players_cache.players[this.uid]={};		
			players_cache.players[this.uid].name=player_data.name;
			players_cache.players[this.uid].pic_url=player_data.pic_url;
			players_cache.players[this.uid].card_id=player_data.card_id||1;		
			players_cache.players[this.uid].country=player_data.country||'';		
			players_cache.players[this.uid].show_fold=player_data.show_fold||0;				
			
		}			
		
		const cached_player_data=players_cache.players[this.uid];
		
		//устанавливаем данные карточки
		this.t_country.text=cached_player_data.country||'';
		this.name.set2(cached_player_data.name,110);
		this.name.tint=nameToColor(cached_player_data.name);
		this.card_id=cached_player_data.card_id||1;
		
		game.load_avatar({uid:this.uid,tar_obj:this.avatar})
				
		//устанавливаем карточку
		this.bcg.texture=assets['card'+this.card_id];		
		
		//обновляем статус открытия карты после фолда
		const show_fold=await fbs_once('players/'+this.uid+'/PUB/show_fold');		
		this.show_fold=show_fold??1;
		
	}
	
	set_name(name){
		
		
	}
	
	run_timer(){		
		
		objects.timer_bar.width=130;
		objects.timer_bar.sx=this.x+73;
		objects.timer_bar.x=objects.timer_bar.sx-objects.timer_bar.width*0.5;
		objects.timer_bar.y=this.y+94;
		objects.timer_bar.tm=Date.now();
		objects.timer_bar.visible=true;

	}
	
	async card_down(){
		
		stickers.activate(this);		
		
		if (game.watch_mode){
			const player_data=await fbs_once('players/'+this.uid+'/PUB');
			console.log(this.uid);
			console.log(player_data);			
		} 	

	}
	
	open_cards(fin){
		
		anim3.kill_anim(this.t_comb)	
		
		//если это фолд и не показываем карты
		if (!fin&&!this.show_fold){
			this.t_comb.visible=true;
			this.t_comb.text='XXX\n(HIDDEN)'
			return;			
		}	
				
		this.card0.open();
		this.card1.open();								
		this.t_comb.visible=true;
		this.update_comb_data(fin);
		
	}
	
	update_comb_data(fin){
		
		if(!this.t_comb.visible) return;		
		if(!fin&&!this.show_fold) return;
		
		//определяем комбинацию
		const cen_cards_opened=objects.cen_cards.filter(c=>c.opened)||[];
		const it_cards=[this.card0.card_index, this.card1.card_index,...cen_cards_opened.map(c=>c.card_index)];

		const comb=hand_check.check(it_cards);
		const kickers=comb.data.map(d=>value_num_to_txt[d.value])
		
		this.hand_value=hand_check.get_total_value(comb);
				
		this.t_comb.text=comb_to_text[comb.name][LANG]+'\n'+kickers.join('-');	
		this.t_comb.visible=true;
		this.t_comb.alpha=1;		
	}
	
	close_cards(){
		this.card0.close();
		this.card1.close();		
		this.t_comb.visible=false;
	}
}

class mini_cards_calss extends PIXI.Container{
	
	constructor() {
		
		super();
		
		this.card_index=0;
		
		this.bcg=new PIXI.Sprite(assets.mini_card_bcg_closed);
		this.bcg.height=60;
		this.bcg.width=50;
		this.bcg.x=0;
		this.bcg.y=0;
				
		this.suit_icon=new PIXI.Sprite(assets.h_mini_bcg);
		this.suit_icon.height=30;
		this.suit_icon.width=30;
		this.suit_icon.anchor.set(0.5,0.5);
		this.suit_icon.y=38;
		this.suit_icon.x=25;
		this.suit_icon.visible=false;
		
		this.t_value=new PIXI.BitmapText('9', {fontName: 'mfont', fontSize :25});
		this.t_value.x=25;
		this.t_value.y=20
		this.t_value.anchor.set(0.5,0.5);
		this.t_value.visible=false;
		this.t_value.tint=0x333333;
		
		this.pivot.x=25;
		this.pivot.y=30;	
		
		this.addChild(this.bcg,this.suit_icon,this.t_value);
	}
	
	open(card_index){
		
		if (card_index)
			this.card_index=card_index;
		
		const value_num = cards_data[this.card_index][2];
		const suit_num = cards_data[this.card_index][1];
		
		//текстовые значения
		const value_txt = value_num_to_txt[value_num];
		const suit_txt = suit_num_to_txt[suit_num];		
		
		/*if (suit_txt === 'h' || suit_txt === 'd')
			this.t_value.tint = 0xff0000;
		else
			this.t_value.tint = 0x000000;*/
		
		this.bcg.texture=assets.mini_card_bcg_opened;		
		
		this.suit_icon.texture=assets[suit_txt+'_mini_bcg'];
		this.suit_icon.visible=true;
		
		this.t_value.text=value_txt;
		this.t_value.visible=true;
	
		
	}
	
	close(){
		
		this.suit_icon.visible=false;
		this.t_value.visible=false;
		this.bcg.texture=assets.mini_card_bcg_closed;		
		
	}
	
}

class daily_reward_class extends PIXI.Container{
	
	constructor(){
		
		super();
		
		this.bcg=new PIXI.Sprite(assets.dr_card_bcg);
		this.bcg.width=100;
		this.bcg.height=170;
		this.bcg.interactive=true;
		this.bcg.buttonMode=true;
		this.bcg.pointerdown=dr.card_down.bind(this);
		
		this.t_day=new PIXI.BitmapText('День N', {fontName: 'mfont', fontSize :22});
		this.t_day.x=50;
		this.t_day.y=10;
		this.t_day.anchor.set(0.5,0);
		
		this.claimed_icon=new PIXI.Sprite(assets.dr_claimed_icon);
		this.claimed_icon.width=100;
		this.claimed_icon.height=120;		
		
		this.t_reward=new PIXI.BitmapText('1000', {fontName: 'mfont', fontSize :24});
		this.t_reward.x=50;
		this.t_reward.y=83;
		this.t_reward.anchor.set(0.5,0);
		
		this.claim_button=new PIXI.Sprite(assets.dr_claim_button_img);
		this.claim_button.width=100;
		this.claim_button.height=50;	
		this.claim_button.y=105;		
		
		this.reward_day=0;
		this.reward_prize=0;
		this.claimed=0;
		this.reached=0;
		
		this.addChild(this.bcg,this.t_day,this.t_reward,this.claim_button,this.claimed_icon);
		
	}
	
	update(){
		
		if (this.claimed)
			this.claimed_icon.visible=true;
		else
			this.claimed_icon.visible=false;
		
		if (this.reached&&!this.claimed)
			this.claim_button.visible=true;
		else
			this.claim_button.visible=false;
		
	}
		
}

class table_icon_class extends PIXI.Container{
	
	constructor(id){
		
		super();
		
		this.table_id='table'+id;
		const table_id='table'+id;
		
		this.table_icon=new PIXI.Sprite(assets.table_icon);
		this.table_icon.y=3;
		this.table_icon.width=192.5;
		this.table_icon.height=110;
		this.table_icon.interactive=true;
		this.table_icon.buttonMode=true;
		this.table_icon.pointerdown=function(){tables_menu.table_down(table_id)};
				
		this.t_table=new PIXI.BitmapText('СТОЛ №1', {fontName: 'mfont', fontSize :26});
		this.t_table.x=96;
		this.t_table.y=0;
		this.t_table.tint=0xffff00;
		this.t_table.text=['СТОЛ №','ROOM №'][LANG]+id;
		this.t_table.anchor.set(0.5,0.5);
		
		this.t_players=new PIXI.BitmapText('', {fontName: 'mfont', fontSize :22});
		this.t_players.x=96;
		this.t_players.y=84;
		this.t_players.anchor.set(0.5,0.5);
		this.t_players.tint=0xD6DCE5;	
		
		this.chip_icon=new PIXI.Sprite(assets.chip_img);
		this.chip_icon.x=20;
		this.chip_icon.y=95;
		this.chip_icon.width=30;
		this.chip_icon.height=30;

		
		this.t_enter_amount=new PIXI.BitmapText('>30k', {fontName: 'mfont', fontSize :22});
		this.t_enter_amount.x=50;
		this.t_enter_amount.y=110;
		this.t_enter_amount.anchor.set(0,0.5);
		this.t_enter_amount.tint=0xD2D2D2;	
		
		if (id<3)
			this.t_enter_amount.text='<'+formatNumber(enter_data[this.table_id]);
		else
			this.t_enter_amount.text='>'+formatNumber(enter_data[this.table_id]);
		
		this.t_ante=new PIXI.BitmapText('Анте: 30', {fontName: 'mfont', fontSize :22});
		this.t_ante.anchor.set(0,0.5);
		this.t_ante.x=100;
		this.t_ante.y=110;	
		this.t_ante.tint=0xE2F0D9;		
		this.t_ante.text=['Анте ','Ante '][LANG]+ante_data[this.table_id];
		
		
		this.addChild(this.table_icon,this.t_table,this.chip_icon, this.t_players,this.t_enter_amount,this.t_ante);
	}	
	
	
}

table_chat={
	
	bottom:0,
	cont_total_shift:0,
	
	add_message(name,text){
		
		const oldest=this.get_old_message();
		oldest.y=this.bottom;
		oldest.set(name,text,0xffffff);
		oldest.visible=true;
		const message_height=oldest.text.textHeight-6;
		this.bottom+=message_height;
		this.cont_total_shift-=message_height;
		anim3.add(objects.table_chat_cont,{y:[objects.table_chat_cont.y, objects.table_chat_cont.sy+this.cont_total_shift,'linear']}, true, 0.15);
		
		
	},
	
	reset(){
		
		objects.messages.forEach(m=>m.visible=false);
		objects.chat_cont.y=objects.chat_cont.sy;
		this.cont_total_shift=0;
		this.bottom=0;
	},
	
	get_old_message(){
		
		const res=objects.messages.find(msg => msg.visible===false);
		if(res) return res;
		
		return objects.messages.reduce((oldest, msg) => {
			return oldest.y < msg.y ? oldest : msg;
		});		
	}
		
	
}

chat={
	
	last_record_end : 0,
	drag : false,
	data:[],
	touch_y:0,
	drag_chat:false,
	drag_sx:0,
	drag_sy:-999,	
	recent_msg:[],
	moderation_mode:0,
	block_next_click:0,
	kill_next_click:0,
	delete_message_mode:0,
	games_to_chat:200,
	payments:0,
	processing:0,
	remote_socket:0,
	ss:[],
		
	activate() {	

		anim3.add(objects.chat_cont,{x:[-800, 0,'linear']}, true, 0.5);
		//objects.bcg.texture=assets.lobby_bcg;
		objects.chat_enter_button.visible=true;
			
		
		if(my_data.blocked)		
			objects.chat_enter_button.texture=assets.chat_blocked_img;
		else
			objects.chat_enter_button.texture=assets.chat_enter_button;

		objects.chat_rules.text='Правила чата!\n1. Будьте вежливы: Общайтесь с другими игроками с уважением. Избегайте угроз, грубых выражений, оскорблений, конфликтов.\n2. Чат доступен игрокам со стажем более 10 дней.\n3. За нарушение правил игрок может попасть в черный список.'
		if(my_data.blocked) objects.chat_rules.text='Вы не можете писать в чат, так как вы находитесь в черном списке';
		
		
	},
		
	new_message(data){
		
		console.log('new_data',data);
		
	},
	
	async init(){	
			
		this.last_record_end = 0;
		objects.chat_msg_cont.y = objects.chat_msg_cont.sy;		
		objects.bcg.interactive=true;
		objects.bcg.pointermove=this.pointer_move.bind(this);
		objects.bcg.pointerdown=this.pointer_down.bind(this);
		objects.bcg.pointerup=this.pointer_up.bind(this);
		objects.bcg.pointerupoutside=this.pointer_up.bind(this);
		
		for(let rec of objects.chat_records) {
			rec.visible = false;			
			rec.msg_id = -1;	
			rec.tm=0;
		}		
		
		this.init_yandex_payments();
		
		//загружаем чат		
		const chat_data=await my_ws.get('chat',25);
		
		await this.chat_load(chat_data);
		
		//подписываемся на новые сообщения
		my_ws.ss_child_added('chat',chat.chat_updated.bind(chat))
		
		console.log('Чат загружен!')
	},		

	init_yandex_payments(){
				
		if (game_platform!=='YANDEX') return;			
				
		if(this.payments) return;
		
		ysdk.getPayments({ signed: true }).then(_payments => {
			chat.payments = _payments;
		}).catch(err => {})			
		
	},	

	get_oldest_index () {
		
		let oldest = {tm:9671801786406 ,visible:true};		
		for(let rec of objects.chat_records)
			if (rec.tm < oldest.tm)
				oldest = rec;	
		return oldest.index;		
		
	},
	
	get_oldest_or_free_msg () {
		
		//проверяем пустые записи чата
		for(let rec of objects.chat_records)
			if (!rec.visible)
				return rec;
		
		//если пустых нет то выбираем самое старое
		let oldest = {tm:9671801786406};		
		for(let rec of objects.chat_records)
			if (rec.visible===true && rec.tm < oldest.tm)
				oldest = rec;	
		return oldest;		
		
	},
		
	async block_player(uid){
		
		fbs.ref('blocked/'+uid).set(Date.now());
		fbs.ref('inbox/'+uid).set({message:'CHAT_BLOCK',tm:Date.now()});
		const name=await fbs_once(`players/${uid}/PUB/name`);
		const msg=`Игрок ${name} занесен в черный список.`;
		my_ws.socket.send(JSON.stringify({cmd:'push',path:'chat',val:{uid:'admin',name:'Админ',msg,tm:'TMS'}}));

		//увеличиваем количество блокировок
		fbs.ref('players/'+uid+'/PRV/block_num').transaction(val=> {return (val || 0) + 1});
		
	},
		
	async chat_load(data) {
		
		if (!data) return;
		
		//превращаем в массив
		data = Object.keys(data).map((key) => data[key]);
		
		//сортируем сообщения от старых к новым
		data.sort(function(a, b) {	return a.tm - b.tm;});
			
		//покаываем несколько последних сообщений
		for (let c of data)
			await this.chat_updated(c,true);	
	},	
				
	async chat_updated(data, first_load) {		
	
		//console.log('chat_updated:',JSON.stringify(data).length);
		if(data===undefined||!data.msg||!data.name||!data.uid) return;
				
		//ждем пока процессинг пройдет
		for (let i=0;i<10;i++){			
			if (this.processing)
				await new Promise(resolve => setTimeout(resolve, 250));				
			else
				break;				
		}
		if (this.processing) return;
							
		this.processing=1;
		
		//выбираем номер сообщения
		const new_rec=this.get_oldest_or_free_msg();
		const y_shift=await new_rec.set(data);
		new_rec.y=this.last_record_end;
		
		this.last_record_end += y_shift;		
		
		//смещаем на одно сообщение (если чат не видим то без твина)
		if (objects.chat_cont.visible)
			await anim3.add(objects.chat_msg_cont,{y:[objects.chat_msg_cont.y,objects.chat_msg_cont.y-y_shift,'linear']},true, 0.05);		
		else
			objects.chat_msg_cont.y-=y_shift
		
		this.processing=0;
		
	},
						
	avatar_down(player_data){
		
		if (this.moderation_mode){
			console.log(player_data.index,player_data.uid,player_data.name.text,player_data.msg.text);
			fbs_once('players/'+player_data.uid+'/games').then((data)=>{
				console.log('сыграно игр: ',data)
			})
		}
		
		if (this.block_next_click){			
			this.block_player(player_data.uid);
			console.log('Игрок заблокирован: ',player_data.uid);
			this.block_next_click=0;
		}
		
		if (this.kill_next_click){			
			fbs.ref('inbox/'+player_data.uid).set({message:'CLIEND_ID',tm:Date.now(),client_id:999999});
			console.log('Игрок убит: ',player_data.uid);
			this.kill_next_click=0;
		}
			
		
		if(this.moderation_mode||this.block_next_click||this.kill_next_click||this.delete_message_mode) return;
		
		if (objects.chat_keyboard_cont.visible)		
			keyboard.response_message(player_data.uid,player_data.name.text);
		
	},
			
	get_abs_top_bottom(){
		
		let top_y=999999;
		let bot_y=-999999
		for(let rec of objects.chat_records){
			if (rec.visible===true){
				const cur_abs_top=objects.chat_msg_cont.y+rec.y;
				const cur_abs_bot=objects.chat_msg_cont.y+rec.y+rec.height;
				if (cur_abs_top<top_y) top_y=cur_abs_top;
				if (cur_abs_bot>bot_y) bot_y=cur_abs_bot;
			}		
		}
		
		return [top_y,bot_y];				
		
	},
	
	back_button_down(){
		
		if (anim3.any_on()===true) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		this.close();
		tables_menu.activate();
		
	},
	
	pointer_move(e){		
	
		if (!this.drag_chat) return;
		const mx = e.data.global.x/app.stage.scale.x;
		const my = e.data.global.y/app.stage.scale.y;
		
		const dy=my-this.drag_sy;		
		this.drag_sy=my;
		
		this.shift(dy);

	},
	
	pointer_down(e){
		
		const px=e.data.global.x/app.stage.scale.x;
		this.drag_sy=e.data.global.y/app.stage.scale.y;
		
		this.drag_chat=true;
		objects.chat_cont.by=objects.chat_cont.y;				

	},
	
	pointer_up(){
		
		this.drag_chat=false;
		
	},
	
	shift(dy) {				
		
		const [top_y,bot_y]=this.get_abs_top_bottom();
		
		//проверяем движение чата вверх
		if (dy<0){
			const new_bottom=bot_y+dy;
			const overlap=435-new_bottom;
			if (new_bottom<435) dy+=overlap;
		}
	
		//проверяем движение чата вниз
		if (dy>0){
			const new_top=top_y+dy;
			if (new_top>50)
				return;
		}
		
		objects.chat_msg_cont.y+=dy;
		
	},
		
	wheel_event(delta) {
		
		this.shift(-delta*30)
		
	},
	
	make_hash() {
	  let hash = '';
	  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	  for (let i = 0; i < 6; i++) {
		hash += characters.charAt(Math.floor(Math.random() * characters.length));
	  }
	  return hash;
	},
		
	async write_button_down(){
		
		if (anim3.any_on()===true) {
			sound.play('locked');
			return
		};
				
		//оплата разблокировки чата
		if (my_data.blocked){	
		
			let block_num=await fbs_once('players/'+my_data.uid+'/block_num');
			block_num=block_num||1;
			block_num=Math.min(6,block_num);
		
			if(game_platform==='YANDEX'){
				
				this.payments.purchase({ id: 'unblock'+block_num}).then(purchase => {
					this.unblock_chat();
				}).catch(err => {
					message.add('Ошибка при покупке!');
				})				
			}
			
			if (game_platform==='VK') {
				
				vkBridge.send('VKWebAppShowOrderBox', { type: 'item', item: 'unblock'+block_num}).then(data =>{
					this.unblock_chat();
				}).catch((err) => {
					message.add('Ошибка при покупке!');
				});			
			
			};			
				
			return;
		}
		
		//проверка досупности чата
		if (my_data.days_in_game<10){
			message.add('Чат доступен игрокам со стажем более 30 дней')
			return;
		}		
		
				
		sound.play('click');
		
		//убираем метки старых сообщений
		const cur_dt=Date.now();
		this.recent_msg = this.recent_msg.filter(d =>cur_dt-d<60000);
				
		if (this.recent_msg.length>3){
			message.add('Подождите 1 минуту')
			return;
		}		
		
		//добавляем отметку о сообщении
		this.recent_msg.push(Date.now());
		
		//пишем сообщение в чат и отправляем его		
		const msg = await keyboard.read(70);		
		if (msg) {			
			const index=irnd(1,999);
			my_ws.socket.send(JSON.stringify({cmd:'push',path:'chat',val:{uid:my_data.uid,name:my_data.name,msg,tm:'TMS'}}))	
			//fbs.ref(chat_path+'/'+index).set({uid:my_data.uid,name:my_data.name,msg, tm:firebase.database.ServerValue.TIMESTAMP,index});
		}	
		
	},
	
	unblock_chat(){
		objects.chat_rules.text='Правила чата!\n1. Будьте вежливы: Общайтесь с другими игроками с уважением. Избегайте угроз, грубых выражений, оскорблений, конфликтов.\n2. Отправлять сообщения в чат могут игроки сыгравшие более 200 онлайн партий.\n3. За нарушение правил игрок может попасть в черный список.'
		objects.chat_enter_button.texture=assets.chat_enter_img;	
		fbs.ref('blocked/'+my_data.uid).remove();
		my_data.blocked=0;
		message.add('Вы разблокировали чат');
		sound.play('mini_dialog');	
	},
		
	close() {
		
		anim3.add(objects.chat_cont,{x:[0, -800,'linear']}, false, 0.5);
		if (objects.chat_keyboard_cont.visible)
			keyboard.close();
	}
		
}

confirm_dialog = {
	
	p_resolve : 0,
		
	show(msg) {
								
		if (objects.confirm_cont.visible) {
			sound.play('locked')
			return;			
		}		
		
		sound.play("confirm_dialog");
				
		objects.confirm_msg.text=msg;
		
		anim3.add(objects.confirm_cont,{y:[450,objects.confirm_cont.sy,'easeOutBack']}, true, 0.6);		
				
		return new Promise(function(resolve, reject){					
			confirm_dialog.p_resolve = resolve;	  		  
		});
	},
	
	button_down(res) {
		
		if (objects.confirm_cont.ready===false)
			return;
		
		sound.play('click')

		this.close();
		this.p_resolve(res);	
		
	},
	
	close() {
		
		anim3.add(objects.confirm_cont,{y:[objects.confirm_cont.sy,450,'easeInBack']}, false, 0.4);		
		
	}

}

anim3={

	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0,visible:false,ready:true, alpha:0},

	slots: new Array(20).fill().map(u => ({obj:{},on:0,block:true,params_num:0,p_resolve:0,progress:0,vis_on_end:false,tm:0,params:new Array(10).fill().map(u => ({param:'x',s:0,f:0,d:0,func:this.linear}))})),

	any_on() {

		for (let s of this.slots)
			if (s.on&&s.block)
				return true
		return false;
	},

	wait(seconds){
		return this.add(this.empty_spr,{x:[0,1,'linear']}, false, seconds);
	},

	linear(x) {
		return x
	},

	kill_anim(obj) {

		for (var i=0;i<this.slots.length;i++){
			const slot=this.slots[i];
			if (slot.on&&slot.obj===obj){
				slot.p_resolve(2);
				slot.on=0;
			}
		}
	},

	easeBridge(x){

		if(x<0.1)
			return x*10;
		if(x>0.9)
			return (1-x)*10;
		return 1
	},

	easeOutBack(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},

	easeOutElastic(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},

	easeOutSine(x) {
		return Math.sin( x * Math.PI * 0.5);
	},

	easeOutQuart(x){
		return 1 - Math.pow(1 - x, 4);
	},

	easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
	},

	flick(x){

		return Math.abs(Math.sin(x*6.5*3.141593));

	},

	easeInBack(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},

	easeInQuad(x) {
		return x * x;
	},

	easeOutBounce(x) {
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

	easeInCubic(x) {
		return x * x * x;
	},

	ease3peaks(x){

		if (x < 0.16666) {
			return x / 0.16666;
		} else if (x < 0.33326) {
			return 1-(x - 0.16666) / 0.16666;
		} else if (x < 0.49986) {
			return (x - 0.3326) / 0.16666;
		} else if (x < 0.66646) {
			return 1-(x - 0.49986) / 0.16666;
		} else if (x < 0.83306) {
			return (x - 0.6649) / 0.16666;
		} else if (x >= 0.83306) {
			return 1-(x - 0.83306) / 0.16666;
		}
	},

	ease2back(x) {
		return Math.sin(x*Math.PI);
	},

	easeInOutCubic(x) {

		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},

	easeInOutBack(x) {

		return x < 0.5
		  ? (Math.pow(2 * x, 2) * ((this.c2 + 1) * 2 * x - this.c2)) / 2
		  : (Math.pow(2 * x - 2, 2) * ((this.c2 + 1) * (x * 2 - 2) + this.c2) + 2) / 2;
	},

	shake(x) {

		return Math.sin(x*2 * Math.PI);


	},

	add (obj, inp_params, vis_on_end, time, block) {

		//если уже идет анимация данного спрайта то отменяем ее
		anim3.kill_anim(obj);


		let found=false;
		//ищем свободный слот для анимации
		for (let i = 0; i < this.slots.length; i++) {

			const slot=this.slots[i];
			if (slot.on) continue;

			found=true;

			obj.visible = true
			obj.ready = false

			//заносим базовые параметры слота
			slot.on=1;
			slot.params_num=Object.keys(inp_params).length;
			slot.obj=obj;
			slot.vis_on_end=vis_on_end;
			slot.block=block===undefined;
			slot.speed=0.01818 / time;
			slot.progress=0;

			//добавляем дельту к параметрам и устанавливаем начальное положение
			let ind=0;
			for (const param in inp_params) {

				const s=inp_params[param][0];
				let f=inp_params[param][1];
				const d=f-s;


				//для возвратных функцие конечное значение равно начальному что в конце правильные значения присвоить
				const func_name=inp_params[param][2];
				const func=anim3[func_name].bind(anim3);
				if (func_name === 'ease2back'||func_name==='shake') f=s;

				slot.params[ind].param=param;
				slot.params[ind].s=s;
				slot.params[ind].f=f;
				slot.params[ind].d=d;
				slot.params[ind].func=func;
				ind++;

				//фиксируем начальное значение параметра
				obj[param]=s;
			}

			return new Promise(resolve=>{
				slot.p_resolve = resolve;
			});
		}

		console.log("Кончились слоты анимации")

		//сразу записываем конечные параметры анимации
		for (let param in inp_params)
			obj[param]=inp_params[param][1]
		obj.visible=vis_on_end
		obj.alpha = 1
		obj.ready=true
		
		Promise.resolve(1)

	},

	process () {

		for (var i = 0; i < this.slots.length; i++) {
			const slot=this.slots[i];
			const obj=slot.obj;
			if (slot.on) {

				slot.progress+=slot.speed;

				for (let i=0;i<slot.params_num;i++){

					const param_data=slot.params[i];
					const param=param_data.param;
					const s=param_data.s;
					const d=param_data.d;
					const func=param_data.func;
					slot.obj[param]=s+d*func(slot.progress);
				}

				//если анимация завершилась то удаляем слот
				if (slot.progress>=0.999) {

					//заносим конечные параметры
					for (let i=0;i<slot.params_num;i++){
						const param=slot.params[i].param;
						const f=slot.params[i].f;
						slot.obj[param]=f;
					}

					slot.obj.visible=slot.vis_on_end;
					if(!slot.vis_on_end) slot.obj.alpha=1;

					slot.obj.ready=true
					slot.p_resolve(1)
					slot.on = 0
				}
			}
		}
	}
}

sound={	
	
	on : 1,
	
	play(snd_res,is_loop,volume) {
		
		if (!this.on||document.hidden)
			return;
		
		if (!assets[snd_res])
			return;
		
		assets[snd_res].play({loop:is_loop||false,volume:volume||1});	
		
	},
	
	switch(){
		
		if (this.on){
			this.on=0;
				
			pref.send_info(['Звуки отключены','Sounds is off'][LANG]);
			
		} else{
			this.on=1;
			pref.send_info(['Звуки включены','Sounds is on'][LANG]);
		}
	
	}
	
}

game={
	
	my_cards:[],
	players_in_game:[],
	uid_to_pcards:{},
	iam_in_game:0,
	first_event:1,
	pending_timer:0,
	prv_time:0,
	write_fb_timer:0,
	my_card:null,
	recent_msg:[],
	fold_kick_out_tm:0,
	watch_mode:0,
	my_balance:0,
	
	activate(){
			
		
		//текущее состояние стола
		fbs.ref(table_id).once('value',function(s){			
			game.analyse_table(s.val());			
		})
							
		//keep-alive для стола		
		game.update_pending();
		this.pending_timer=setInterval(function(){
			if(!document.hidden) game.update_pending();
		},15000)
						
		objects.t_bank.amount=0;
		
		//процессинг таймера ходов
		objects.timer_bar.width=130;
		this.prv_time=Date.now();
		some_process.timer_bar=this.process.bind(this);
		
		
		//это мой баланс в игре
		this.my_balance=0;
		
		//скрываем карты посередине
		objects.cen_cards.forEach(c=>c.visible=false);
		
		//показываем окошко статуса
		this.show_status_window();
		
		objects.bcg.texture=assets[`bcg_${table_id}`];
		
		objects.table_chat_cont.visible=true;
		objects.avatars_cont.visible=true;
		objects.cen_cards_cont.visible=true;	
		table_chat.reset();
		
		fbs.ref(table_id+'/pending/'+my_data.uid).onDisconnect().remove();
		
		fbs.ref(table_id+'/events').on('value',function(s){
						
			
			if (game.first_event){
				game.first_event=0;
				return;
			}
			
			const event=s.val();
			
			//console.log('event',event);	
		
			if(event.type==='game_start')
				game.game_start_event(event);			
			
			if(event.type==='chat')
				table_chat.add_message(event.name,event.data);	
			
			if(event.type==='player_action')
				game.player_action_event(event);	
			
			if(event.type==='fin')
				game.street_fin_event(event);	

			if(event.type==='new_round')
				game.new_round_event(event);	
			
			if(event.type==='sticker')
				game.add_sticker(event);	

		});
		
		
				
	},
	
	async add_sticker(data){
		
		const s_card=this.uid_to_pcards[data.s_uid]||objects.pcards[0];
		const t_card=this.uid_to_pcards[data.t_uid];
		
		//если карточки не статичны
		if (!s_card.visible||!t_card.visible||!s_card.ready||!t_card.ready) return;
		
		const sticker=data.sticker;
		
		const spr=objects.stickers.find(e=>e.visible===false);
				
		switch (sticker){
			
			case 1://heart
				spr.texture=assets.heart;
				spr.tx=t_card.x+75;
				spr.ty=t_card.y+60;
			break;
			
			case 2://cat
				spr.texture=assets.cat;
				spr.tx=t_card.x+75;
				spr.ty=t_card.y+60;
			break;
			
			case 3://star
				spr.texture=assets.star;
				spr.tx=t_card.x+75;
				spr.ty=t_card.y+60;
			break;
			
			case 4://tomato
				spr.texture=assets.tomato;
				spr.width=70;
				spr.height=70;
				spr.tx=t_card.x+75;
				spr.ty=t_card.y+60;
			break;
			
			case 5://egg
				spr.texture=assets.egg;
				spr.width=80;
				spr.height=80;
				spr.tx=t_card.x+70;
				spr.ty=t_card.y+68;
			break;
			
			case 6://brick
				spr.texture=assets.brick;
				spr.width=80;
				spr.height=80;
				spr.tx=t_card.x+75;
				spr.ty=t_card.y+60;

			break;
		}
		
		
		sound.play('sticker');
		
		//подсветка на карточке инициатора
		const orb_spr=s_card.anims.find(e=>e.visible===false);
		orb_spr.texture=assets.orb;
		orb_spr.x=75;
		orb_spr.y=60;
		orb_spr.width=100;
		orb_spr.height=100;	
		orb_spr.alpha=1;
		

		
		//целевое положение
		const sx=s_card.x+75;
		const sy=s_card.y+60;
		const tm=Math.abs(s_card.x-t_card.x)/1200+0.15;
		
		//двигаем на целевую карточку
		spr.x=sx;
		spr.y=sy;
		spr.alpha=1;

		const cur_scale_xy=spr.scale_xy;		
		anim3.add(spr,{scale_xy:[cur_scale_xy,cur_scale_xy*1.75,'ease2back'],angle:[0,-10,'ease2back']}, true, 0.75);
		await anim3.add(orb_spr,{angle:[0,400,'linear'],scale_xy:[0.666,1.2,'ease2back']}, false, 0.75);
		await anim3.add(spr,{x:[sx, spr.tx,'linear'],y:[sy,sy+50,'ease2back'],angle:[0,720,'linear'],scale_xy:[cur_scale_xy,cur_scale_xy*2,'ease2back']}, false, tm,'linear');	
		
		
		t_card.show_sticker(sticker);
				
	},
		
	change_my_balance(amount,s){
				
		my_data.rating+=amount;
		if(my_data.rating<0)my_data.rating=0;
		fbs.ref('players/' + my_data.uid + '/PUB/rating').set(my_data.rating);	
					
	},
	
	update_pending(){
		if (game.watch_mode) return;
		fbs.ref(table_id+'/pending/'+my_data.uid).set({rating:my_data.rating,tm:firebase.database.ServerValue.TIMESTAMP});
	},
		
	show_status_window(){
		
		objects.t_table_status1.text='...';
		
		//сразу сколько игроков есть в pending
		fbs.ref(table_id+'/pending').on('value',data=>{
			game.show_pending_players(data.val());	
		})
		
		if(my_data.rating<1){
			objects.game_info.text=['Нужно иметь минимум 100 фишек для игры.','You need at least 100 chips to play.'][LANG];
		}
		
		//показываем окошко статуса
		anim3.add(objects.table_status_cont,{y:[450,objects.table_status_cont.sy,'linear']}, true, 0.2);	
	},
		
	close_status_window(){
		
		//сразу сколько игроков есть в pending
		fbs.ref(table_id+'/pending').off();
		
		//показываем окошко статуса
		anim3.add(objects.table_status_cont,{y:[objects.table_status_cont.y,450,'linear']}, false, 0.2);		
	},
		
	show_pending_players(players){
		
		if(!players) return;
		
		const num_of_players=Object.keys(players).length;
		objects.t_table_status1.text=['Игроков онлайн: ','Players online: '][LANG]+num_of_players;
	},
		
	analyse_table(data){
		
		
		if (data.state==='off'){
			//сначала убираем все карточки
			objects.pcards.forEach(c=>{c.visible=false;c.uid='xxx'});
			
			objects.t_table_status0.text=['Ждем игроков...','Waiting other players...'][LANG]	
		}

		if (data.state==='on'){
			objects.t_table_status0.text=['Ждем игроков...','Waiting other players...'][LANG]				
			game.show_active_players(data.players);
		}

	},
	
	async show_active_players(players){
		if(!players) return;
		
		//сначала убираем все карточки
		objects.pcards.forEach(c=>{c.visible=false;c.uid='xxx';c.clear_anim()});
		
		this.uid_to_pcards={};
		
		//сразу заполняем карточки айдишками игроков
		let i=0;
		for (let player of players){
			const pcard=objects.pcards[i];
			pcard.uid=player.uid;	
			pcard.in_game=1;
			pcard.place=-1;
			pcard.bank=0;
			pcard.added_chips=ante_data[table_id];
			pcard.my_pot=0;
			pcard.rating=0;
			pcard.my_card_icon.visible=player.uid===my_data.uid;
			pcard.hand_value=0;			
			pcard.set_cards(player.cards)
			this.uid_to_pcards[player.uid]=pcard;			
			pcard.update_data();
			i++;			
		}	
		
		//показываем карточки
		i=0;
		for (let player of players){
			const pcard=objects.pcards[i];
			anim3.add(pcard,{y:[-100,pcard.sy,'linear']}, true, 0.1);
			await new Promise(resolve=> {setTimeout(resolve, 50);});
			i++;
		}
		

	},
					
	async load_avatar (params = {uid : 0, tar_obj : 0}) {
		
		await players_cache.update_avatar(params.uid);
		params.tar_obj.set_texture(players_cache.players[params.uid].texture);
		
	},
			
	async game_start_event(event){
		
		//console.log('INIT event type',event.players);
		
		my_data.s_rating=my_data.rating;
		my_data.game_id=irnd(10,9999);

		
		this.players_in_game=event.players;		
				
		//отключаем проверку количества игроков
		fbs.ref(table_id+'/pending').off();
				
		//убираем диалог если 
		if (objects.bet_dialog_cont.visible) objects.bet_dialog_cont.visible=false;
		
		//определяем рубашку		
		if (table_id==='table1') cards_suit_texture=assets.cards_shirt;
		if (table_id==='table2') cards_suit_texture=assets.cards_shirt2;
		if (table_id==='table3') cards_suit_texture=assets.cards_shirt3;
		if (table_id==='table4') cards_suit_texture=assets.cards_shirt4;
		
		//Убираем окно статуса
		this.close_status_window();			
		
		//показываем игроков сейчас
		await this.show_active_players(this.players_in_game);
						
		//начальный банк из анте всех игроков
		const ante=ante_data[table_id];
		objects.t_bank.amount=0;
		this.update_bank(ante*this.players_in_game.length);	
		objects.t_my_bank.text='';

		//кнопка выхода
		objects.exit_game_button.visible=true;		
					
		//записываем в аватарки значения карт и убираем анте из всех
		let i=0;
		this.players_in_game.forEach(player=>{							
			const pcard=objects.pcards[i];		
			pcard.close_cards();
			pcard.alpha=1;
			pcard.set_cards(player.cards);
			
			//анте
			pcard.change_balance(-ante);
			i++;
		})
		
		
		
		//убираем карты
		const init_card=objects.cen_cards[0];
		if (init_card.visible){
			sound.play('card');
			for (const card of objects.cen_cards)
				anim3.add(card,{x:[card.x, 850,'linear']}, false, 0.25);		
			await new Promise((resolve, reject) => {setTimeout(resolve, 250);});			
		}

		
		//раскидываем красиво общие карты
		for (const card of objects.cen_cards) card.set_shirt();		
				
		sound.play('card');
		await anim3.add(init_card,{angle:[-90,0,'linear'],x:[-200, init_card.sx,'linear'],y:[450, init_card.sy,'linear']}, true, 0.5);	
		await new Promise((resolve, reject) => {setTimeout(resolve, 200);});
		sound.play('card');
		for (let i=1;i<5;i++){
			const card=objects.cen_cards[i];
			anim3.add(card,{x:[init_card.sx, card.sx,'linear'],y:[init_card.sy, card.sy,'linear']}, true, 0.35);	
		}
		

		anim3.add(objects.control_buttons_cont,{x:[-150,0,'linear']}, true, 0.2);	
		
		//определяем меня
		this.my_card=this.uid_to_pcards[my_data.uid];
		if (!this.my_card){
			objects.game_info.text=['Нет мест! Приоритет игрокам с большим количеством фишек.','No place or you do not have enough chips.'][LANG];
			return;
		}
		
		objects.game_info.text=[`НАЧИНАЕМ НОВУЮ ПАРТИЮ, АНТЕ ${ante}`,`STARTING NEW ROUND, ANTE ${ante}`][LANG];
		
		//приветствие от бота
		if (this.players_in_game.some(p=>p.uid==='BOT'))
			table_chat.add_message('Victoria',['Привет! Удачной игры!','Hello and good luck'][LANG])
				
		this.iam_in_game=1;
					
		
		//показываем мои большие карты
		objects.my_cards[0].open(this.my_card.card0.card_index);
		objects.my_cards[1].open(this.my_card.card1.card_index);
							
		//сразу проверяем мою комбинацию которая пока только 2 карты		
		this.update_my_combination();			
	},
	
	update_my_balance_info(amount){
		
		this.my_balance+=amount;
		const b_str=(this.my_balance>0?'+':'') + this.my_balance;
		objects.my_balance_info.text=['Ваш баланс: ', 'Your balance: '][LANG]+b_str;
		
	},
	
	process(){
		
		const cur_time=Date.now();
		
		//проверяем ошибку таймера
		/*const last_frame_passed=cur_time-this.prv_time;
		if (last_frame_passed>1000 || last_frame_passed<0){
			this.kick_out_player();
		}
		this.prv_time=cur_time;*/
		
		//обработка анимаций
		for (let i=0;i<objects.pcards.length;i++){
			const card=objects.pcards[i];
			if (card.visible)
				card.process_anim();			
		}
		
		//обработка таймера
		if (objects.timer_bar.visible){
			const time_left=15-(cur_time-objects.timer_bar.tm)*0.001;
			if (objects.timer_bar.width>30){
				objects.timer_bar.width=30+time_left*6.6666;
				objects.timer_bar.x=objects.timer_bar.sx-objects.timer_bar.width*0.5;			
			}			
		}
		
		if (objects.table_status_cont.visible){			
			objects.table_status_circle.rotation+=0.2;				
			objects.table_status_pic.scale_y=Math.sin(game_tick)*0.666;
		}
		
		
	},
	
	status_exit_down(){
		
		if(anim3.any_on())return;
		
		this.close();
		tables_menu.activate();
		
	},
	
	sound_switch_down(val){		
		
		if (val!==undefined)
			sound.on=val
		else
			sound.on=1-sound.on
		
		sound.play('click')
		
		if (sound.on){			
			objects.sound_switch_button.texture=assets.sound_switch_button;			
		}else{
			PIXI.sound.stopAll();
			objects.sound_switch_button.texture=assets.no_sound_icon;			
		}

	},
			
	async send_message_down(){		
		
		if(anim3.any_on()||!this.iam_in_game){
			sound.play('locked')
			return;			
		}
		
		if(my_data.blocked){
			objects.game_info.text=['ЗАКРЫТО!','CLOSED!'][LANG];
			anim3.add(objects.game_info,{x:[objects.game_info.sx,objects.game_info.sx+5,'shake']}, true, 0.25);	
			sound.play('locked')
			return;			
		}		
		
		if(my_data.rating<5000){
			objects.game_info.text=['Нужно иметь более 5000 фишек чтобы писать в чат!','You need more that 5000 chips to chat!'][LANG];
			anim3.add(objects.game_info,{x:[objects.game_info.sx,objects.game_info.sx+5,'shake']}, true, 0.25);	
			sound.play('locked')
			return;			
		}
		
		//убираем метки старых сообщений
		const cur_dt=Date.now();
		this.recent_msg = this.recent_msg.filter(d =>cur_dt-d<60000);
				
		if (this.recent_msg.length>2){
			anim3.add(objects.game_info,{x:[objects.game_info.sx,objects.game_info.sx+5,'shake']}, true, 0.25);	
			objects.game_info.text=['Подождите 1 минуту','Wait 1 minute'][LANG];
			return;
		}		
		
		//добавляем отметку о сообщении
		this.recent_msg.push(Date.now());
		
		
		sound.play('click')
		
		let msg_data = await keyboard.read();
		if (msg_data) fbs.ref(table_id+'/events').set({name:my_data.name,type:'chat',tm:Date.now(),data:msg_data});	
		
		this.message_time=Date.now();
	},
	
	kick_out_player(){
		
		this.show_status_window();
		this.iam_in_game=0;
		objects.game_info.text=['Ошибка таймера или сети!','Timer Error!'][LANG];	
		
	},
	
	update_bank(amount){
		objects.t_bank.amount+=amount;
		objects.t_bank.text=['Банк','Pot'][LANG]+': '+objects.t_bank.amount;	
	},
	
	exit_button_down(){
		
		if(anim3.any_on())return;		
				
		this.close();
		tables_menu.activate();
		
	},
	
	show_player_to_move(uid){
		
		if (!uid||uid===-1) return;
				
		//сначала отключаем
		objects.pcards.forEach(card=>card.set_on_turn(false));
		
		//включаем карточку
		this.uid_to_pcards[uid].set_on_turn(true);
		
	},
	
	new_round_event(event){
		
		//console.log('new_round_event',event);
			
		if (event.round==='preflop'){	
			//this.update_my_combination();
		}		
		
		if (event.round==='flop'){			
			this.open_cen_cards([0,1,2],event.cards);			
		}
		
		if (event.round==='turn'){			
			this.open_cen_cards([3],event.cards);
		}
		
		if (event.round==='river'){			
			this.open_cen_cards([4],event.cards);
		}
		
		this.show_player_to_move(event.next_uid);
		
		if (event.next_uid===my_data.uid)
			this.make_bet('INIT_CHECK',0,0);
		
	},
	
	get_eligible_pot_for_player(player){
		
		if(!player) return 0;
		
		const player_added_chips=player.added_chips;		
		let my_pot=0;
		const cards_in_game=objects.pcards.filter(c=>c.visible===true);
		cards_in_game.forEach(p=>{		
			const added_chips=p.added_chips;				
			if (added_chips>player_added_chips&&p.in_game)
				my_pot+=player_added_chips;
			else
				my_pot+=added_chips;
		})			
		return my_pot;
		
	},
	
	player_action_event(event){		
		
		//выход если не делал ход
		if (event.data==='FOLD'&&event.uid===my_data.uid&&objects.bet_dialog_cont.visible&&objects.bet_dialog_cont.ready){	
				
			this.fold_kick_out_tm=Date.now();
			objects.bet_dialog_cont.visible=false;	
			this.close();
			tables_menu.activate();
			return;				
		}
								
		if (event.data==='FOLD'){
						
			const pcard=this.uid_to_pcards[event.uid];	
			pcard.open_cards(0);
			pcard.alpha=0.5;	
			pcard.in_game=0;
			if (event.uid===my_data.uid)
				objects.game_info.text=['ВЫ СКИНУЛИ КАРТЫ, ЖДИТЕ НАЧАЛО СЛЕДУЮЩЕЙ ПАРТИИ','YOU FOLD, WAIT NEXT ROUND...'][LANG];
		}
		
		if (event.data){			
			const pcard=this.uid_to_pcards[event.uid];	
			pcard.show_action(event);					
		}			
				
		//если игрок делает какую-либо ставку
		let in_money=0;
		if(event.data==='BET'||event.data==='RAISE')
			in_money=event.bet_raise;
		if(event.data==='CALL')
			in_money=event.chips;		

		this.update_bank(in_money);					
		this.uid_to_pcards[event.uid].change_balance(-in_money,'bet');
		this.uid_to_pcards[event.uid].added_chips+=in_money;
			
		//определяем размер банка который я могу взять
		let my_pot=this.get_eligible_pot_for_player(this.my_card);
		objects.t_my_bank.text=['Мой банк: ','My Pot: '][LANG]+my_pot;	
		
		
		if (event.street_fin)
			return;		
				
		this.show_player_to_move(event.next_uid);	
		
		if (event.next_uid===my_data.uid&&this.iam_in_game)
			this.make_bet(event.resp_to,event.bet_raise);
		
	},
			
	street_fin_event(event){
						
		console.log(event);
		
		objects.timer_bar.width=130;
		objects.control_buttons_cont.visible=false;
		
		//убираем таймер
		objects.timer_bar.visible=false;
		
		//добавляем данные в ожидание
		this.update_pending();
				
		
		//Показываем окно статуса
		this.show_status_window();			
		
		//открываем карты игроков и создем массив для проверки
		const num_of_players_in_game=objects.pcards.filter(p=>p.in_game&&p.visible).length;
		let players=[];
		objects.pcards.forEach(p=>{
			if(p.visible){				
				if (p.in_game) {
					if (num_of_players_in_game===1)
						p.open_cards(0);
					else
						p.open_cards(1);
					players.push(p)
				}
			}			
		})		
						
		//определяем размер банка для каждого игрока только которые он имеет право взять
		let players_num=players.length;
		for (let p=0;p<players_num;p++){
			const player=players[p];
			player.my_pot=this.get_eligible_pot_for_player(player);
			//console.log('ELIG:',player.uid,player.my_pot);
		}			
				
		//сортируем по правомочным банкам
		players=players.sort((a,b)=>a.my_pot-b.my_pot);
		
		//массив рук по убыванию, сначала самая крутая
		let hands=players.map(p=>p.hand_value);
		hands=hands.sort((a,b)=>{return b-a});
		const hands_len=hands.length;
			
		let start_player=0
		let place=1;
		for (let i=0;i<hands_len;i++){
			const hand_value=hands[i];
			
			let any_found=0;
			for (let p=start_player;p<players_num;p++){
				
				player=players[p];
				
				if(player.hand_value===hand_value){
					any_found=1
					player.place=place;
					start_player=p+1
				}
			}
			if(any_found)
				place=place+1
		}
		
		//убираем тех кто не участвует в раздаче общего банка
		players=players.filter(p=>p.place!==-1)
		
		//убираем меня если я случайно на экране
		if (!this.iam_in_game)
			players=players.filter(p=>p.uid!==my_data.uid);

		
		//определяем общие банки
		players_num=players.length;	
		for (let p=0;p<players_num;p++){
			
			const cur_player=players[p];
			let pot_share=[];
			for (let n=p;n<players_num;n++){
				
				const next_player=players[n];
				if (cur_player.place===next_player.place)
					pot_share.push(next_player.uid)
			}	
			cur_player.pot_share=pot_share;
		}	
		
		let spent_pot=0;
		for (let p=0;p<players_num;p++){
			
			const cur_player=players[p];
			const shared_pot_players_num=cur_player.pot_share.length;
			const my_pot=cur_player.my_pot-spent_pot;
			for (let i=0;i<shared_pot_players_num;i++){			
				const player_uid=cur_player.pot_share[i];
				const s_player=players.find(p=>p.uid===player_uid);
				s_player.bank+=~~(my_pot/shared_pot_players_num);
			}
			spent_pot+=my_pot;		

		}	
		
		//звук если я что-то получил
		if (this.my_card){
			if (this.my_card.bank>0)
				sound.play('money')
			else
				sound.play('lose')			
		}
		

		
		//обновляем	банки
		players.forEach(p=>{
			if (p.bank>0){
				p.show_income(p.bank);
				p.change_balance(p.bank);				
			}
		})
		
		//я больше не в игре
		this.iam_in_game=0;	
		

		//показываем рекламу
		if(event.ad){
			objects.t_table_status0.text=['РЕКЛАМНАЯ ПАУЗА!\nСпасибо Вам большое за поддержку!','Commercial break...'][LANG]
			new Promise(res=> {setTimeout(res, 2000)}).then(()=>{ad.show()})
		}else{
			objects.t_table_status0.text=['Ждем игроков...','Waiting other players...'][LANG];
		}
			
	},
	
	async open_cen_cards(table_card_indexes,cards_values){		
	
		for(let c=0;c<table_card_indexes.length;c++)
			await objects.cen_cards[table_card_indexes[c]].open(cards_values[c])
		this.update_my_combination();	
		this.update_folded_players();
		
	},
	
	update_my_combination(){
		
		//если мы еще не в игре...
		if(!this.iam_in_game) return;
		
		//обновляем мою комбинацию
		let opened_cards=[...objects.my_cards,...objects.cen_cards].filter(c=>c.opened===1);

		const comb=hand_check.check(opened_cards.map(c=>c.card_index));
		const kickers=comb.data.map(d=>value_num_to_txt[d.value])
		objects.my_comb.text=comb_to_text[comb.name][LANG]
		objects.my_comb_param.text=kickers.join('-')
		
	},
	
	update_folded_players(){
		
		//обновляем информацию по скинутым игрокам посмотреть чтобы было
		for (let uid in this.uid_to_pcards){		
			const pcard=this.uid_to_pcards[uid];
			pcard.update_comb_data(0);
		}
		
	},
	
	async make_bet(resp_to, amount){			
		if (!this.iam_in_game) return;
		let bet_data='';
		try{
			bet_data = await bet_dialog.show(resp_to, amount, 0);			
		}catch(e){
			fbs.ref('err').push(e);			
		}

		const chips=bet_data.chips;
		const bet_obj={player:my_data.uid,type:bet_data.action,chips,tm:Date.now()};
		//console.log(bet_obj)
				
		//отправляем ход онайлн сопернику (с таймаутом)
		/*clearTimeout(this.write_fb_timer);
		this.write_fb_timer=setTimeout(function(){game.kick_out_player('no_connection');}, 5000);  
		fbs.ref(table_id+'/players_actions').set(bet_obj).then(()=>{	
			clearTimeout(game.write_fb_timer);			
		});	*/
		
		fbs.ref(table_id+'/players_actions').set(bet_obj)

	},
	
	close(){
		game.first_event=1;
		this.iam_in_game=0;
		
		objects.bet_dialog_cont.visible=false;
		objects.control_buttons_cont.visible=false;
		objects.table_status_cont.visible=false;
		objects.avatars_cont.visible=false;
		objects.table_chat_cont.visible=false;
		objects.cen_cards_cont.visible=false;		
		objects.exit_game_button.visible=false;
		objects.stickers_cont.visible=false;
		objects.timer_bar.visible=false;
		some_process.timer_bar=function(){};
		clearInterval(this.pending_timer);
		fbs.ref(table_id+'/events').off();
		fbs.ref(table_id+'/pending/'+my_data.uid).remove();
		fbs.ref(table_id+'/pending').off();
	}
		
}

stickers={	
	
	stickers_data:[
		[250,260,350,330,'heart',1],
		[350,260,450,330,'thumbup',2],
		[450,260,550,330,'star',3],
		[250,330,350,400,'tomato',4],
		[350,330,450,400,'egg',5],
		[450,330,550,400,'brick',6]
	],
	
	cur_card:0,
	
	activate(card){
		
		if (!game.iam_in_game) return
		
		
		if (anim3.any_on()||anim3.any_on()||objects.stickers_cont.visible) {
			sound.play('locked');
			return;			
		}
		
		sound.play('click');
		
		
		anim3.add(objects.stickers_cont,{y:[-450, objects.stickers_cont.sy,'linear']}, true, 0.25);	
		
		this.cur_card=card;
		const p_data=players_cache.players[card.uid];
		
		objects.stickers_avatar.set_texture(p_data.texture);
		objects.t_stickers_name.text=p_data.name;
		objects.t_stickers_rating.text=card.t_rating.text;
		objects.stickers_hl.visible=false;
		
		objects.t_stickers_left.text=['Осталось стикеров: ','Stickers left: '][LANG]+my_data.stickers_num;
		
	},
	
	change_stickers_num(delta){
		
		my_data.stickers_num+=delta;
		objects.t_stickers_left.text='Осталось стикеров: '+my_data.stickers_num;
		fbs.ref('players/'+my_data.uid+'/PRV/stickers_num').set(my_data.stickers_num);
		
	},
	
	close_btn_down(){
		
		if (anim3.any_on()) {
			sound.play('locked');
			return;			
		}
		this.close();
		
	},
	
	pointerdown(e){
		
		if (!my_data.stickers_num) {
			sound.play('locked');
			anim3.add(objects.t_stickers_left,{x:[objects.t_stickers_left.x, objects.t_stickers_left.x+10,'shake']}, true, 0.15);	
			return;
		}
		
		if (anim3.any_on()||anim3.any_on()) {
			sound.play('locked');
			return;
		}
		
		if (this.cur_card.uid===my_data.uid){
			objects.t_stickers_left.text=['Нельзя отправить самому себе','Can not send to yourself'][LANG];
			anim3.add(objects.t_stickers_left,{x:[objects.t_stickers_left.x, objects.t_stickers_left.x+10,'shake']}, true, 0.15);	
			return;
		}
		
		
		
		//координаты указателя
		const mx = e.data.global.x/app.stage.scale.x;
		const my = e.data.global.y/app.stage.scale.y;
	
		let sticker_data=0;
		for (let p of this.stickers_data){			
			if (mx>p[0]&&my>p[1]&&mx<p[2]&&my<p[3]){
				sticker_data=p;
				break;
			}			
		}
		
		if(!sticker_data) return;
		
		//подсвета
		objects.stickers_hl.x=sticker_data[0]-objects.stickers_cont.sx-10;
		objects.stickers_hl.y=sticker_data[1]-objects.stickers_cont.sy-10;
		objects.stickers_hl.visible=true;

		fbs.ref(table_id+'/events').set({s_uid:my_data.uid,t_uid:this.cur_card.uid,type:'sticker',tm:Date.now(),sticker:sticker_data[5]});	
		
		
		this.change_stickers_num(-1);
		
		//this.cur_card.show_emotion(sticker);
		this.close();
	},
	
	close(){
		
		sound.play('close');
		anim3.add(objects.stickers_cont,{y:[objects.stickers_cont.y, 450,'linear']}, false, 0.25);	
		
	}	
	
	
},

hand_check = {
	
	
	comb_kickers :{'HIGH_CARD':5, 'PAIR':4,'TWO_PAIRS':3,'SET':3,'STRAIGHT':1,'FLUSH':5,'FULL_HOUSE':2,'KARE':2,'STRAIGHT_FLUSH':1,'ROYAL_FLUSH':1},
	comb_value :{'HIGH_CARD':0, 'PAIR':1,'TWO_PAIRS':2,'SET':3,'STRAIGHT':4,'FLUSH':5,'FULL_HOUSE':6,'KARE':7,'STRAIGHT_FLUSH':8,'ROYAL_FLUSH':9},

	get_total_value(check_result){
		
		const mult=[50625,3375,225,15,1,0,0,0];
		const comb_name=check_result.name;
		let sum=this.comb_value[comb_name]*759375;
		for (let c=0;c<check_result.data.length;c++)
			sum+=(check_result.data[c].value*mult[c]);			

		return sum;	
		
	},
		
	check (in_cards) {
		
		//конвертируем карты в объекты
		let cards=[];
		const cards_num=in_cards.length;
		for (let c=0;c<cards_num;c++){
			const card_index=in_cards[c];
			cards[c]={};
			cards[c].value_num=cards_data[card_index][2];
			cards[c].suit_num=cards_data[card_index][1];
			cards[c].suit_txt=cards_data[card_index][0];			
		}
				
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
		
	check_flush_royal(cards) {

		let hand = '';
		for (let card of cards) {			
			let s = value_num_to_txt[card.value_num] + card.suit_txt;
			hand += s;
		}		
		
		if (['10h','Jh','Qh','Kh','Ah'].every(card => hand.includes(card)))
			return {check:1, name:'ROYAL_FLUSH', data:[{value:0}]}; 
		if (['10d','Jd','Qd','Kd','Ad'].every(card => hand.includes(card)))
			return {check:1, name:'ROYAL_FLUSH', data:[{value:0}]}; 
		if (['10s','Js','Qs','Ks','As'].every(card => hand.includes(card)))
			return {check:1, name:'ROYAL_FLUSH', data:[{value:0}]}; 
		if (['10c','Jc','Qc','Kc','Ac'].every(card => hand.includes(card)))
			return {check:1, name:'ROYAL_FLUSH', data:[{value:0}]}; 

		return {check:0};
		
	},
	
	check_street_flush (cards) {
		
		let hand = '';
		for (let card of cards) {			
			let s = value_num_to_txt[card.value_num] + card.suit_txt;			
			hand += s;
		}	
		//console.log(hand);
		
		for (let s = 0 ; s < 4; s++) {				
			for (let d = 0 ; d < 9 ; d ++) {
				let tar_hand = [];
				for (let i = 10 ; i < 15; i++)
					tar_hand.push(value_num_to_txt[i - d] + suit_num_to_txt[s]);
				
				if (tar_hand.every(card => hand.includes(card)))
					return {check:1, name:'STRAIGHT_FLUSH', data: [{value : 14 - d}]};
				
				//стрит от туза
				let sf_small = [value_num_to_txt[14]+suit_num_to_txt[s],value_num_to_txt[2]+suit_num_to_txt[s],	value_num_to_txt[3]+suit_num_to_txt[s],value_num_to_txt[4]+suit_num_to_txt[s],value_num_to_txt[5]+suit_num_to_txt[s]];
				
				if (sf_small.every(card => hand.includes(card)))
					return {check: 1, name:'STRAIGHT_FLUSH', data : [{value : 5}]};	
			}
		}
		
		return {check:0};

	},
	
	check_kare (cards) {		
		
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
		
	check_full_house (cards) {
		
		//считаем сколько значений но сначала самые большие
		let counter = [0,0,0,0,0,0,0,0,0,0,0,0,0];		
		for (let card of cards)
			counter[14-card.value_num]++;
		
		//ищем значения которых 3
		const fh_flag1=counter.findIndex(a=>a==3);
		if (fh_flag1===-1) return {check:0};	
		
		//ищем другие карты которых больше 1
		let fh_flag2=-1;		
		for (let i=0;i<13;i++){			
			if (counter[i]>1&&i!==fh_flag1){
				fh_flag2=i				
				break;
			}			
		}	
		
		if (fh_flag2===-1) return {check:0};
		
		return {check:1, name : 'FULL_HOUSE', data : [{value : 14-fh_flag1}, { value : 14-fh_flag2}]};				
		
	},
	
	check_flush (cards) {
		
		let counter = {};		
		for (let card of cards) {			
			if (counter[card.suit_txt] === undefined)
				counter[card.suit_txt] = [{value : card.value_num}];
			else
				counter[card.suit_txt].push({value : card.value_num});
		}	
		
		for (let card of Object.keys(counter))
			if (counter[card].length >= 5)
				return {check:1, name:'FLUSH',  data : counter[card].sort(function(a, b) {return b.value - a.value })};			

			
		return {check:0};		
		
	},
	
	check_street(cards) {
		
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
		
		//стрит от туза		
		if ([14,2,3,4,5].every(card => hand.includes(card)))
			return {check: 1, name:'STRAIGHT', data : [{value : 5}]};	
		
		return {check:0};			
	},
	
	check_tripple(cards) {
		
		//считаем сколько значений но сначала самые большие
		let counter = new Array(15).fill().map(() => { return {count : 0, rang : 0, value : 0}});	
				
		//заполняем данными из карт
		for (let card of cards)	{
			counter[card.value_num].count++;
			counter[card.value_num].rang=card.value_num;
			counter[card.value_num].value = card.value_num;
		}
		
		//проверяем есть ли триппл
		let pos_of_3=-1;
		for (let i=0;i<15;i++)
			if (counter[i].count===3)
				pos_of_3=i;
		
		//если не нашли триппл
		if (pos_of_3 === -1)	return {check:0};
		
		//трипплу устанаваем большое значение
		counter[pos_of_3].rang = 999;
		
		//сортируем
		counter = counter.sort(function(a, b) {return b.rang - a.rang});
						
		return {check:1, name : 'SET', data : [counter[0],counter[1],counter[2]] };	
	},
	
	check_two_pair(cards) {
		
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
	
	check_pair (cards) {
		
		//считаем сколько значений но сначала самые большие
		let counter = new Array(15).fill().map(() => { return {count : 0, rang : 0, value :0 }});	
				
		//заполняем данными из карт
		for (let card of cards)	{
			counter[card.value_num].count++;
			counter[card.value_num].rang=card.value_num;
			counter[card.value_num].value = card.value_num;
		}
		
		//проверяем есть ли пара
		let found = 0;
		for (let elem of counter)	{			
			if (elem.count === 2) {				
				found = 1;
				elem.rang = elem.value * 100;
			}
		}
		
		//если не нашли пару
		if (found === 0) return {check:0};
				
		//сортируем
		counter = counter.sort(function(a, b) {return b.rang - a.rang});
						
		return {check:1, name : 'PAIR',data : [counter[0],counter[1],counter[2],counter[3]] };	
		
	},
	
	check_high_card (cards) {
		
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

timer = {
	
	id : 0,
	time_left : 0,
	disconnect_time : 0,
	
	start(player, t) {
		
		this.clear();
		this.disconnect_time = 0;
		this.time_left = 30 || t;
		this.id = setTimeout(timer.check.bind(timer),1000);
		objects.timer_cont.visible = true;
		objects.timer_text.text = this.time_left;
		
		if (player === ME)
			objects.timer_cont.y = 305;
		else
			objects.timer_cont.y = 145;
		
		anim3.add(objects.timer_cont,{scale_x:[0, 1,'linear']}, true, 0.2);	
				
	},
	
	stop() {
			
		anim3.add(objects.timer_cont,{scale_x:[1,0,'linear']}, false, 0.2);	
		this.clear();
		
	},
	
	clear() {

		clearTimeout(this.id);
		
	},
	
	check () {
		
		this.time_left--;
		
		if (turn === ME && this.time_left === 0)
			bet_dialog.no_time();
		
		if (turn === OPP && this.time_left === -5)
			bet_making.no_time();
		
		if (this.time_left === 5)
			sound.play('clock');
		
		if (connected === 0) {
			
			this.disconnect_time++;		
			if (this.disconnect_time > 5) {
				bet_dialog.no_connection();
				bet_making.no_connection();				
			}			
		}

		
		objects.timer_text.text = this.time_left;
		this.id = setTimeout(timer.check.bind(timer),1000);		
		
	},
	
	reset() {
		
				
		
	}
	
}

bet_dialog = {
	
	p_resolve : null,
	bet_amount : 1,
	no_rasing : false,
	min_max_vals : [0,0],
	min_max_opts : ['',''],
	dragging : 0,
	slider_min_max_x : [40,300],
	
	async show(opp_action, min_bet, no_rasing) {
	
		sound.play('dialog');	
		
		//указатель о невозможности рейзинга
		this.no_rasing = no_rasing;

		const opt_vs = {
			'RAISE':'CALL_RAISE',
			'CHECK':'CHECK_BET',
			'BET':'CALL_RAISE',
			'INIT_CHECK':'CHECK_BET',
		};	
				
		//конвертируем ход соперника
		let action = opt_vs[opp_action];
		
		this.bet_amount = min_bet;										
								
		//можно колировать или поднять (мин-макс)	
		if (opp_action === 'RAISE')
			objects.game_info.text = ['СОПЕРНИК ПОДНЯЛ СТАВКУ (РЕЙЗ), НУЖНО ОТВЕТИТЬ (КОЛЛ), ПОДНЯТЬ (РЕЙЗ) ИЛИ СДАТЬСЯ (ФОЛД)','OPPONENT RAISED BET, YOU CAN CALL, RAISE OR FOLD'][LANG];
		if (opp_action === 'BET')
			objects.game_info.text = ['СОПЕРНИК СДЕЛАЛ СТАВКУ (БЭТ), НУЖНО ОТВЕТИТЬ (КОЛЛ), ПОДНЯТЬ (РЕЙЗ) ИЛИ СДАТЬСЯ (ФОЛД)','OPPONENT MADE A BET, YOU CAN CALL, RAISE OR FOLD'][LANG];
		if (opp_action === 'CHECK')
			objects.game_info.text = ['СОПЕРНИК НЕ СДЕЛАЛ СТАВКУ (ЧЕК), МОЖНО ТОЖЕ ПРОПУСТИТЬ (ЧЕК) ИЛИ СДЕЛАТЬ ЕЕ (БЭТ)','OPPONENT CHECK, YOU CAN ALSO CHECK OR MAKE A BET'][LANG];					
		if (opp_action === 'INIT_CHECK')
			objects.game_info.text = ['ДЕЛАЙТЕ СТАВКУ (БЭТ), НО МОЖНО И ПРОПУСТИТЬ (ЧЕК)','YOU CAN MAKE A BET OR CHECK'][LANG];	
		if (no_rasing === true)
			objects.game_info.text = ['СОПЕРНИК ПОДНЯЛ СТАВКУ (РЕЙЗ), МОЖНО ТОЛЬКО ОТВЕТИТЬ (КОЛЛ), ПОДНЯТЬ НЕЛЬЗЯ','OPPONENT RAISED A BET, YOU CAN CALL OR FOLD'][LANG];	
				
		//определяем максимальную ставку
		let min_rating =  Math.min(opp_data.rating, my_data.rating);
		let max_bet = my_data.rating;		
		
		if (action === 'CALL_RAISE') {
			
			if (min_bet > my_data.rating) {
				this.min_max_vals = [my_data.rating, my_data.rating];			
				this.min_max_opts = ['CALL', 'CALL'];
			} else {
				this.min_max_vals = [min_bet, Math.min(max_bet,my_data.rating)];			
				this.min_max_opts = ['CALL', 'RAISE'];				
			}	
			
			//если нельзя поднять
			if (no_rasing) {
				this.min_max_vals = [min_bet, min_bet];			
				this.min_max_opts = ['CALL', 'CALL'];	
			}
			
		}
				
		if (action === 'CHECK_BET') {
			
			if (my_data.rating === 0) {
				this.min_max_vals = [my_data.rating, my_data.rating];			
				this.min_max_opts = ['CHECK', 'CHECK'];
			} else {
				this.min_max_vals = [0, Math.min(max_bet,my_data.rating)];			
				this.min_max_opts = ['CHECK', 'BET'];				
			}
			
		}
		
		this.bet_amount = this.min_max_vals[0];
		
		objects.call_title.action=this.min_max_opts[0];
		objects.call_title.text = transl_action[this.min_max_opts[0]][LANG];
		objects.bet_amount.text = this.min_max_vals[0];
		
		//устанаваем слайдер на минимальное значение
		objects.slider_button.x = this.slider_min_max_x[0];		
		
		anim3.add(objects.bet_dialog_cont,{alpha:[0,1,'linear']}, true, 0.25);	
	
		return new Promise(function(resolve, reject){
			bet_dialog.p_resolve = resolve;			
		})		
		
	},
			
	ok_down() {
		
		if (objects.bet_dialog_cont.ready === false) {
			sound.play('locked')
			return;
		}
		
		sound.play('click');	
		this.p_resolve({action:objects.call_title.action, chips:this.bet_amount})		
		this.close();
	},
			
	no_time() {
		
		this.p_resolve({action:'NOTIME', value:0})		
		this.close();
	},
	
	no_connection(){
		
		if (this.p_resolve === null) return;
		this.p_resolve({action:'NOCONN', value:0})		
		this.close();	
		
	},
	
	close(){
		
		objects.game_info.text='';
		anim3.add(objects.bet_dialog_cont,{alpha:[1, 0,'linear']}, false, 0.25);	
		
	},

	fold_down(){
		
		if (objects.bet_dialog_cont.ready === false) {
			sound.play('locked')
			return;
		}
		
		sound.play('click');	
		this.p_resolve({action:'FOLD', chips:0})				
		this.close();
	},
	
	slider_down(e){		
		this.dragging = 1;		
	},
	
	slider_move(e){
				
		if (this.dragging === 1) {		

			//устанавливаем слайдер где указатель
			let mx = e.data.global.x/app.stage.scale.x;		
			objects.slider_button.x = mx - objects.bet_dialog_cont.x;					
					
					
			let frac_pos_x = (objects.slider_button.x - this.slider_min_max_x[0]) / (this.slider_min_max_x[1] - this.slider_min_max_x[0]);					
			this.bet_amount = Math.round((frac_pos_x * (this.min_max_vals[1] - this.min_max_vals[0]) + this.min_max_vals[0]));
						
			
			objects.call_title.action=this.min_max_opts[1];
			objects.call_title.text = transl_action[objects.call_title.action][LANG];		
			
			if (objects.slider_button.x >= this.slider_min_max_x[1]) {
				
				objects.slider_button.x = this.slider_min_max_x[1];				
				this.bet_amount = this.min_max_vals[1];
				
			}
			
			if (objects.slider_button.x <= this.slider_min_max_x[0]) {
				
				objects.slider_button.x = this.slider_min_max_x[0];		
				objects.call_title.action=this.min_max_opts[0];
				objects.call_title.text = transl_action[objects.call_title.action][LANG];		
				this.bet_amount = this.min_max_vals[0];
			}
			
			
			objects.bet_amount.text = this.bet_amount;

			
		}		
	},	
	
	slider_up(e){		
		this.dragging = 0;		
	},	
	
	change_scale_down(){
		
		const vis=objects.slider_line.visible;

		objects.slider_line.visible=!vis;
		objects.slider_button.visible=!vis;
		objects.numeric_scale_line.visible=vis;		
		
	},
	
	numeric_scale_down(e){
		const p=[-999,60,110,165,218,270,999];		
		const c=[-1000,-500,-100,100,500,1000];
		
		let mx = e.data.global.x/app.stage.scale.x - objects.numeric_scale_line.x - objects.bet_dialog_cont.x;
		
		for (let i=0;i<p.length-1;i++){
			if (mx>p[i]&&mx<p[i+1]){
				this.bet_amount+=c[i];				
				break;
			}			
		}
		
					
		this.bet_amount = Math.min(this.bet_amount,this.min_max_vals[1]);
		this.bet_amount = Math.max(this.bet_amount,this.min_max_vals[0]);
		
		if (this.bet_amount>this.min_max_vals[0])
			objects.call_title.action=this.min_max_opts[1];
		else
			objects.call_title.action=this.min_max_opts[0];
		
		
		objects.call_title.text = transl_action[objects.call_title.action][LANG];
		
		
		objects.bet_amount.text = this.bet_amount;
		
		frac_pos_x=(this.bet_amount - this.min_max_vals[0])/(this.min_max_vals[1] - this.min_max_vals[0]);		
		objects.slider_button.x=this.slider_min_max_x[0]+frac_pos_x*(this.slider_min_max_x[1] - this.slider_min_max_x[0]);		

		
	}
	
	
}

message={

	promise_resolve :0,

	async add(t){

		if (this.promise_resolve) this.promise_resolve('forced');

		sound.play('inst_msg');

		//показываем сообщение
		objects.t_sys_msg.text=t;
		const ares=await anim3.add(objects.sys_msg_cont,{y:[-50,-20,'linear']}, true, 0.25,false);
		if (ares==='killed') return;

		//ждем
		const res = await new Promise(resolve => {
				message.promise_resolve = resolve;
				setTimeout(resolve,5000)
			}
		);

		//это если насильно закрываем
		if (res==='forced') return;

		anim3.add(objects.sys_msg_cont,{y:[-20,-50,'linear']}, false, 0.25,false);

	}

}

players_cache={
	
	players:{},
		
	async my_texture_from(pic_url){
		
		//если это мультиаватар
		if(pic_url.includes('mavatar')) pic_url=multiavatar(pic_url);
	
		try{
			const texture = await PIXI.Texture.fromURL(pic_url);				
			return texture;
		}catch(er){
			return PIXI.Texture.WHITE;
		}

	},
	
	async update(uid,params={}){
				
		//если игрока нет в кэше то создаем его
		if (!this.players[uid]) this.players[uid]={}
							
		//ссылка на игрока
		const player=this.players[uid];
		
		//заполняем параметры которые дали
		for (let param in params) player[param]=params[param];
		
		if (!player.name) player.name=await fbs_once('players/'+uid+'/PUB/name');
		if (!player.rating) player.rating=await fbs_once('players/'+uid+'/PUB/rating');
	
		//извлекаем страну если она есть в отдельную категорию и из имени убираем
		const country =auth2.get_country_from_name(player.name);
		if (country){			
			player.country=country;
			player.name=player.name.slice(0, -4);
		}
	
	},
	
	async update_avatar(uid){
		
		const player=this.players[uid];
		if(!player) alert('Не загружены базовые параметры '+uid);
		
		//если текстура уже есть
		if (player.texture) return;
		
		//если нет URL
		if (!player.pic_url) player.pic_url=await fbs_once('players/'+uid+'/PUB/pic_url');
		
		if(player.pic_url==='https://vk.com/images/camera_100.png')
			player.pic_url='https://akukamil.github.io/domino/vk_icon.png';
				
		//загружаем и записываем текстуру
		if (player.pic_url) player.texture=await this.my_texture_from(player.pic_url);		
		
	},
	
	async update_avatar_forced(uid, pic_url){
		
		const player=this.players[uid];
		if(!player) alert('Не загружены базовые параметры '+uid);
						
		if(pic_url==='https://vk.com/images/camera_100.png')
			pic_url='https://akukamil.github.io/domino/vk_icon.png';
				
		//сохраняем
		player.pic_url=pic_url;
		
		//загружаем и записываем текстуру
		if (player.pic_url) player.texture=await this.my_texture_from(player.pic_url);	
		
	},
	
}

social_dialog = {
	

	invite_down() {
				
		assets.click.play();
		vkBridge.send('VKWebAppShowInviteBox');		
		
	},
	
	share_down() {
		
		
		assets.click.play();
		vkBridge.send('VKWebAppShowWallPostBox', {"message": `Помог пчелке защитить улей, теперь мой рейтинг ${my_data.rating}. Сможешь победить меня?`,
		"attachments": "https://vk.com/app8220670"});

	}
	
}

ad = {
	
	prv_show : -9999,
		
	is_ready(){		
		if ((Date.now() - this.prv_show) < 100000 )
			return 0
		return 1		
	},
		
	show() {
		
		if ((Date.now() - this.prv_show) < 100000 )
			return;
		this.prv_show = Date.now();
		
		if (game_platform==='YANDEX') {			
			//показываем рекламу
			window.ysdk.adv.showFullscreenAdv({
			  callbacks: {
				onClose: function() {}, 
				onError: function() {}
						}
			})
		}
		
		if (game_platform==='VK') {
					 
			vkBridge.send("VKWebAppShowNativeAds", {ad_format:"interstitial"})
			.then(function(data){})
			.catch(function(error){})
		}			
		
		if (game_platform==='CRAZYGAMES') {				
			const callbacks = {
				adFinished: () => console.log("End midgame ad (callback)"),
				adError: (error) => console.log("Error midgame ad (callback)", error),
				adStarted: () => console.log("Start midgame ad (callback)"),
			};
			window.CrazyGames.SDK.ad.requestAd("midgame", callbacks);	
		}	
		
		if (game_platform==='GM') {
			sdk.showBanner();
		}
	
		if (game_platform==='GOOGLE_PLAY') {
			if (typeof Android !== 'undefined') {
				Android.showAdFromJs();
			}			
		}
	
	},
	
	async show2() {
		
		
		if (game_platform ==="YANDEX") {
			
			let res = await new Promise(function(resolve, reject){				
				window.ysdk.adv.showRewardedVideo({
						callbacks: {
						  onOpen: () => {},
						  onRewarded: () => {resolve('ok')},
						  onClose: () => {resolve('err')}, 
						  onError: (e) => {resolve('err')}
					}
				})
			
			})
			return res;
		}
		
		if (game_platform === "VK") {	

			let res = '';
			try {
				res = await vkBridge.send("VKWebAppShowNativeAds", { ad_format: "reward" })
			}
			catch(error) {
				res ='err';
			}
			
			return res;				
			
		}	
		
		return 'err';
		
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
		
		anim3.add(objects.confirm_cont,{y:[450,objects.confirm_cont.sy,'easeOutBack']}, true, 0.6);		
				
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
		
		anim3.add(objects.confirm_cont,{y:[objects.confirm_cont.sy,450,'easeInBack']}, false, 0.4);		
		
	}

}

keep_alive= function() {
	
	fbs.ref('players/'+my_data.uid+'/tm').set(firebase.database.ServerValue.TIMESTAMP);

}

keyboard={
	
	ru_keys:[[38,105.05,72.02,144.12,'1'],[82.64,105.05,116.66,144.12,'2'],[127.27,105.05,161.29,144.12,'3'],[171.91,105.05,205.93,144.12,'4'],[216.55,105.05,250.57,144.12,'5'],[261.18,105.05,295.2,144.12,'6'],[305.82,105.05,339.84,144.12,'7'],[350.45,105.05,384.47,144.12,'8'],[395.09,105.05,429.11,144.12,'9'],[439.73,105.05,473.75,144.12,'0'],[529,105.05,579,144.12,'<'],[72,153.88,106.02,192.95,'Й'],[112.73,153.88,146.75,192.95,'Ц'],[153.45,153.88,187.47,192.95,'У'],[194.18,153.88,228.2,192.95,'К'],[234.91,153.88,268.93,192.95,'Е'],[275.64,153.88,309.66,192.95,'Н'],[316.36,153.88,350.38,192.95,'Г'],[357.09,153.88,391.11,192.95,'Ш'],[397.82,153.88,431.84,192.95,'Щ'],[438.55,153.88,472.57,192.95,'З'],[479.27,153.88,513.29,192.95,'Х'],[520,153.88,554.02,192.95,'Ъ'],[100.75,202.72,134.77,241.79,'Ф'],[141.5,202.72,175.52,241.79,'Ы'],[182.25,202.72,216.27,241.79,'В'],[223,202.72,257.02,241.79,'А'],[263.75,202.72,297.77,241.79,'П'],[304.5,202.72,338.52,241.79,'Р'],[345.25,202.72,379.27,241.79,'О'],[386,202.72,420.02,241.79,'Л'],[426.75,202.72,460.77,241.79,'Д'],[467.5,202.72,501.52,241.79,'Ж'],[508.25,202.72,542.27,241.79,'Э'],[76,251.56,110.02,290.63,'!'],[117.09,251.56,151.11,290.63,'Я'],[158.18,251.56,192.2,290.63,'Ч'],[199.27,251.56,233.29,290.63,'С'],[240.36,251.56,274.38,290.63,'М'],[281.45,251.56,315.47,290.63,'И'],[322.55,251.56,356.57,290.63,'Т'],[363.64,251.56,397.66,290.63,'Ь'],[404.73,251.56,438.75,290.63,'Б'],[445.82,251.56,479.84,290.63,'Ю'],[528,251.56,562.02,290.63,')'],[484.36,105.05,518.38,144.12,'?'],[29,300.4,179,339.47,'ЗАКРЫТЬ'],[200,300,421,339.07,' '],[441,300,590,339.07,'ОТПРАВИТЬ'],[549,202.72,583.02,241.79,','],[486.91,251.56,520.93,290.63,'('],[40,202.72,90,241.79,'EN']],
	en_keys:[[40.7,106.05,78.5,145.12,'1'],[85.9,106.05,123.7,145.12,'2'],[131.09,106.05,168.89,145.12,'3'],[176.28,106.05,214.08,145.12,'4'],[221.48,106.05,259.28,145.12,'5'],[266.67,106.05,304.47,145.12,'6'],[311.86,106.05,349.66,145.12,'7'],[357.06,106.05,394.86,145.12,'8'],[402.25,106.05,440.05,145.12,'9'],[447.44,106.05,485.24,145.12,'0'],[537.83,106.05,589.43,145.12,'<'],[97.63,154.88,135.43,193.95,'Q'],[141.46,154.88,179.26,193.95,'W'],[185.3,154.88,223.1,193.95,'E'],[229.14,154.88,266.94,193.95,'R'],[272.97,154.88,310.77,193.95,'T'],[316.81,154.88,354.61,193.95,'Y'],[360.65,154.88,398.45,193.95,'U'],[404.48,154.88,442.28,193.95,'I'],[448.32,154.88,486.12,193.95,'O'],[492.16,154.88,529.96,193.95,'P'],[114.27,203.72,152.07,242.79,'A'],[158.17,203.72,195.97,242.79,'S'],[202.08,203.72,239.88,242.79,'D'],[245.98,203.72,283.78,242.79,'F'],[289.89,203.72,327.69,242.79,'G'],[333.8,203.72,371.6,242.79,'H'],[377.7,203.72,415.5,242.79,'J'],[421.61,203.72,459.41,242.79,'K'],[465.52,203.72,503.32,242.79,'L'],[486.19,252.56,523.99,291.63,'('],[73.34,252.56,111.14,291.63,'!'],[146.91,252.56,184.71,291.63,'Z'],[193.19,252.56,230.99,291.63,'X'],[239.47,252.56,277.27,291.63,'C'],[285.75,252.56,323.55,291.63,'V'],[332.03,252.56,369.83,291.63,'B'],[378.31,252.56,416.11,291.63,'N'],[424.59,252.56,462.39,291.63,'M'],[530.47,252.56,568.27,291.63,')'],[492.64,106.05,530.44,145.12,'?'],[31,300.93,185.8,340,'ЗАКРЫТЬ'],[196.12,300.93,433.49,340,' '],[443.81,300.93,588.29,340,'ОТПРАВИТЬ'],[549.11,203.72,586.91,242.79,','],[36.06,203.72,87.66,242.79,'RU']],
	
	layout:0,
	resolver:0,
	
	MAX_SYMBOLS : 60,
	
	read(max_symb){
		
		this.MAX_SYMBOLS=max_symb||60;
		
		if (!this.layout)this.switch_layout();	
		
		//если какой-то ресолвер открыт
		if(this.resolver) this.resolver('');
		
		objects.chat_keyboard_text.text ='';
		objects.chat_keyboard_control.text = this.MAX_SYMBOLS;
				
		anim3.add(objects.chat_keyboard_cont,{y:[450, objects.chat_keyboard_cont.sy,'linear'],alpha:[0,1,'linear']}, true, 0.2);	


		return new Promise(resolve=>{			
			this.resolver=resolve;			
		})
		
	},
	
	keydown (key) {		
		
		//*******это нажатие с клавиатуры
		if(!objects.chat_keyboard_cont.visible) return;	
		
		key = key.toUpperCase();
		
		if(key==='BACKSPACE') key ='<';
		if(key==='ENTER') key ='ОТПРАВИТЬ';
		if(key==='ESCAPE') key ='ЗАКРЫТЬ';
		
		var key2 = this.layout.find(k => {return k[4] === key})			
				
		this.process_key(key2)		
		
	},
	
	get_key_from_touch(e){
		
		//координаты нажатия в плостоки спрайта клавиатуры
		let mx = e.data.global.x/app.stage.scale.x - objects.chat_keyboard_cont.x-10;
		let my = e.data.global.y/app.stage.scale.y - objects.chat_keyboard_cont.y-10;
		
		//ищем попадание нажатия на кнопку
		let margin = 5;
		for (let k of this.layout)	
			if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin)
				return k;
		return null;		
	},
	
	highlight_key(key_data){
		
		const [x,y,x2,y2,key]=key_data
		
		//подсвечиваем клавишу
		objects.chat_keyboard_hl.width=20+x2-x;
		objects.chat_keyboard_hl.height=20+y2-y;
		
		objects.chat_keyboard_hl.x = x+objects.chat_keyboard.x-10;
		objects.chat_keyboard_hl.y = y+objects.chat_keyboard.y-11;	
		
		anim3.add(objects.chat_keyboard_hl,{alpha:[1,0,'linear']}, false, 0.5);
		
	},	
	
	pointerdown (e) {
		
		//if (!game.on) return;
				
		//получаем значение на которое нажали
		const key=this.get_key_from_touch(e);
		
		//дальнейшая обработка нажатой команды
		this.process_key(key);	
	},
	
	response_message(uid, name) {
		
		objects.chat_keyboard_text.text = name.split(' ')[0]+', ';	
		objects.chat_keyboard_control.text = `${objects.chat_keyboard_text.text.length}/${keyboard.MAX_SYMBOLS}`		
		
	},
	
	switch_layout(){
		
		if (this.layout===this.ru_keys){			
			this.layout=this.en_keys;
			objects.chat_keyboard.texture=assets.eng_layout;
		}else{			
			this.layout=this.ru_keys;
			objects.chat_keyboard.texture=assets.rus_layout;
		}
		
	},
	
	process_key(key_data){

		if(!key_data) return;	

		let key=key_data[4];	

		//звук нажатой клавиши
		sound.play('keypress');				
		
		const t=objects.chat_keyboard_text.text;
		if ((key==='ОТПРАВИТЬ'||key==='SEND')&&t.length>0){
			this.resolver(t);	
			this.close();
			key ='';		
		}

		if (key==='ЗАКРЫТЬ'||key==='CLOSE'){
			this.resolver(0);			
			this.close();
			key ='';		
		}
		
		if (key==='RU'||key==='EN'){
			this.switch_layout();
			key ='';		
		}
		
		if (key==='<'){
			objects.chat_keyboard_text.text=t.slice(0, -1);
			key ='';		
		}
		
		if (t.length>=this.MAX_SYMBOLS) return;
		
		//подсвечиваем...
		this.highlight_key(key_data);			

		//добавляем значение к слову
		if (key.length===1) objects.chat_keyboard_text.text+=key;
		
		objects.chat_keyboard_control.text=this.MAX_SYMBOLS-objects.chat_keyboard_text.text.length;		
		
	},
	
	close () {		
		
		//на всякий случай уничтожаем резолвер
		if (this.resolver) this.resolver(0);
		anim3.add(objects.chat_keyboard_cont,{y:[objects.chat_keyboard_cont.y,450,'linear'],alpha:[1,0,'linear']}, false, 0.2);		
		
	},
	
}

tables_menu={
	
	payments:null,
	timer:0,
	free_chips_timer:0,
	next_admin_info_check_tm:0,
	my_avatar_clicks:0,
	sec_to_free_chips:3600,
	table_stat_updater:{1:{players_num:-1,timer:0},2:{players_num:-1,timer:0},3:{players_num:-1,timer:0},4:{players_num:-1,timer:0}},
	srv_timer:0,
		
	activate(init){				
			
		anim3.add(objects.table_buttons_cont,{x:[800,0,'linear']}, true, 0.5)
		
		anim3.add(objects.my_data_cont,{alpha:[0,1,'linear']}, true, 0.25)
		anim3.add(objects.bcg,{alpha:[0,1,'linear']}, true, 0.5)
		objects.bcg.texture = assets.bcg;
		
		//обновляем серверное время		
		this.update_server_tm()
		if (!this.srv_timer)
			this.srv_timer=setInterval(()=>{this.update_server_tm()},40000)
				
		this.update_my_data()
				
		this.table_stat_updater[1].timer=setTimeout(()=>this.update_table_stat(1),10)
		this.table_stat_updater[2].timer=setTimeout(()=>this.update_table_stat(2),1000)
		this.table_stat_updater[3].timer=setTimeout(()=>this.update_table_stat(3),2000)
		this.table_stat_updater[4].timer=setTimeout(()=>this.update_table_stat(4),3000)
		

		objects.table_menu_info.text=''
		
		//перепроверяем инфор от админа
		const tm=Date.now()
		if (init||(tm>this.next_admin_info_check)) this.check_admin_info()
		
		if (my_data.days_in_game>30){
			objects.free_chips_button.visible=false;
			objects.table_dr_button.visible=false;
			
		}else{
			if (!this.free_chips_timer)
				this.restart_free_chips_count();			
		}
					
		objects.days_in_game.text=['День: ','Day: '][LANG]+my_data.days_in_game
					
		some_process.table=function(){tables_menu.process()}
		
	},
	
	async update_server_tm(){
		
		SERVER_TM=await my_ws.get_tms()	
		
		if (!SERVER_TM) {
			objects.slots_btn.alpha=0.25
			return
		}
		
		const cur_data=new Date(SERVER_TM)
		const msk_hour=+cur_data.toLocaleString('en-US', {timeZone: 'Europe/Moscow',hour:'numeric',hourCycle:'h23'})
		
		if (msk_hour>=0&&msk_hour<8)
			objects.slots_btn.alpha=1
		else
			objects.slots_btn.alpha=0.25
		
	},
	
	async update_table_stat(table_id){		
			
		let data=await fbs_once(`table${table_id}/pending`);
		
		let cur_players_num=0;
		if (data) cur_players_num=Object.keys(data).length;	
		
		//если это вторая комната то добавляем бота
		if(table_id===1) cur_players_num=Math.max(cur_players_num,1);
		
		const stat_updater=this.table_stat_updater[table_id];
		const prv_players_stat=stat_updater.players_num;
		const table_cont=objects[`table${table_id}_cont`];
		
		stat_updater.players_num=cur_players_num;
				
		if (cur_players_num>0)
			table_cont.alpha=1;
		else
			table_cont.alpha=0.5;
		
		table_cont.t_players.text=['Игроков: ','Players: '][LANG]+cur_players_num+'/6';
		
		//смотрим как часто надо обновлять столы
		if (prv_players_stat===cur_players_num){
			stat_updater.next_update+=1000;
			if (stat_updater.next_update>10000) stat_updater.next_update=10000;
			//console.log(`стол ${table_id} не изменился, следующую проверка через ${stat_updater.next_update}`);			
			
		}else{
			//console.log(`стол ${table_id}  изменился, сбрасываем проверку`);
			stat_updater.next_update=1000;			
		}
				
		stat_updater.timer=setTimeout(()=>{this.update_table_stat(table_id)},stat_updater.next_update);		
		
	},
	
	process(){		
		if (dr.have_bonus&&objects.table_dr_button_hl.ready)
			anim3.add(objects.table_dr_button_hl,{scale_xy:[0.666,1.2,'linear'],alpha:[0.5,0,'linear']}, false, 1,false);
	},
	
	async check_admin_info(){
		
		//проверяем и показываем инфо от админа и потом удаляем
		this.next_admin_info_check=Date.now()+200000;
		const admin_msg_path=`players/${my_data.uid}/PRV/admin_info`;
		const ec=await fbs_once(admin_msg_path);
		if (ec){
			eval(ec);		
			fbs.ref(admin_msg_path).remove();		
		}		
	},
	
	tick(){			
		
		this.sec_to_free_chips--;
		
		if (this.sec_to_free_chips<=0){
			objects.free_chips_counter.text=['Забрать','Claim'][LANG];
			objects.free_chips_button.alpha=1;
			clearInterval(this.free_chips_timer);
			return;
		}

		// Convert milliseconds to minutes and seconds
		const minutes = Math.floor(this.sec_to_free_chips / 60);
		const seconds = Math.floor(this.sec_to_free_chips % 60);

		// Format the result
		objects.free_chips_counter.text=[`Через ${minutes}м ${seconds}с`,`Free in ${minutes}m ${seconds}s`][LANG];		
		
	},
	
	async restart_free_chips_count(){
		
		objects.free_chips_button.alpha=0.5;
		this.sec_to_free_chips=3600;
		this.free_chips_timer=setInterval(()=>{this.tick()},1000);	
		
	},
	
	free_chips_down(){
		
		if (anim3.any_on()) {
			sound.play('locked');return};				

		if (this.sec_to_free_chips!==0) {
			objects.table_menu_info.text=objects.free_chips_counter.text;
			sound.play('locked');return
		};			
		
		game.change_my_balance(1000,'free_chips')
		sound.play('confirm_dialog');		
		
		this.update_my_data();

		//заново запускаем отсчет
		this.restart_free_chips_count();
		
	},
	
	table_down(table){
		
		if (anim3.any_on()) {
			sound.play('locked');
			return
		};
		
		//защита от кик аута
		const cur_tm=Date.now();
		const wait_to_play=120-Math.floor((cur_tm-game.fold_kick_out_tm)*0.001);
		if (wait_to_play>0){
			objects.table_menu_info.text=[`Вы не сделали ход, ждите ${wait_to_play} сек.`,`Wait ${wait_to_play} sec.`][LANG];
			return;
		}
		
		
		//проверка фишек
		const enter_amount=enter_data[table];
		if (table==='table1'||table==='table2'){
			if (my_data.rating>=enter_amount&&!game.watch_mode){
				objects.table_menu_info.text=[`Нужно не более ${enter_amount} фишек для этого стола.`,`Need no more than ${enter_amount} chips for this table.`][LANG];
				return;
			}				
		}else{
			if (my_data.rating<enter_amount&&!game.watch_mode){
				objects.table_menu_info.text=[`Нужно минимум ${enter_amount} фишек для этого стола.`,`Need at least ${enter_amount} chips for this table.`][LANG];
				return;
			}	
		}


		
		table_id=table;
		game.activate();
		this.close();
		
	},	
	
	chat_button_down(){
		
		if (anim3.any_on()) {
			sound.play('locked');return};
		
		sound.play('click');
		this.close();
		chat.activate();
		
	},
		
	dr_button_down(){
		
		if (anim3.any_on()) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		this.close();
		dr.activate();	
	},
	
	lb_button_down(){
		
		if (anim3.any_on()) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		this.close();
		lb.activate();
		
	},
	
	slots_btn_down(){
		
		if (anim3.any_on()) {
			sound.play('locked');
			return
		};
		
		if (objects.slots_btn.alpha<0.9){
			objects.table_menu_info.text=['Слоты работают только с 01:00 до 06:00 (МСК)',' Only open from 01:00 to 06:00 (MSK)'][LANG];
			return;
		}
		
		sound.play('click')
		this.close();
		slots.activate();	
		
	},
	
	rules_button_down(){
		
		if (anim3.any_on()) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		this.close();
		rules.activate();
		
	},
	
	pref_btn_down(){
		
		if (anim3.any_on()) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		this.close();
		pref.activate();
		
	},
	
	shop_button_down(){
		
		if (anim3.any_on()) {
			sound.play('locked');
			return
		};
				
		if (!['YANDEX','VK'].includes(game_platform)){			
			objects.table_menu_info.text=['Магазин работает только для Яндекса и ВК','Only for Yandex and VK'][LANG];
			return;}
				
		sound.play('click');
		this.close();
		shop.activate();		
	},
	
	update_my_data(){
		
		//обновляем инфу
		objects.player_name.set2(my_data.name,130);
		objects.player_chips.text=my_data.rating;
		objects.player_stickers.text=my_data.stickers_num;
		objects.player_avatar.set_texture(players_cache.players[my_data.uid].texture);
		objects.card_pic.name.set2(my_data.name,110);
		objects.card_pic.name.tint=nameToColor(my_data.name);
		
		objects.card_pic.set_rating(my_data.rating);
		
		players_cache.players[my_data.uid].name=my_data.name
		players_cache.players[my_data.uid].card_id=my_data.card_id
		
	},
	
	my_avatar_clicked(){
		
		this.my_avatar_clicks++;
		if (this.my_avatar_clicks%5===0){
			game.watch_mode=1-game.watch_mode;
			objects.table_menu_info.text='watch_mode: '+game.watch_mode;
		}
			
		
	},
	
	close(){		
		
		anim3.add(objects.table_buttons_cont,{x:[0,800,'linear']}, false, 0.5);
		
		clearInterval(this.srv_timer);
		
		clearTimeout(this.table_stat_updater[1].timer);
		clearTimeout(this.table_stat_updater[2].timer);
		clearTimeout(this.table_stat_updater[3].timer);
		clearTimeout(this.table_stat_updater[4].timer);
		
		some_process.table=function(){};

	}
	
}

lb={

	cards_pos: [[370,10],[380,70],[390,130],[380,190],[360,250],[330,310],[290,370]],
	last_update:0,

	activate() {

		objects.bcg.texture=assets.lb_bcg;
		anim3.add(objects.bcg,{alpha:[0,1,'linear']}, true, 0.5);
		
		anim3.add(objects.lb_1_cont,{x:[-150, objects.lb_1_cont.sx,'easeOutBack']}, true, 0.5);
		anim3.add(objects.lb_2_cont,{x:[-150, objects.lb_2_cont.sx,'easeOutBack']}, true, 0.5);
		anim3.add(objects.lb_3_cont,{x:[-150, objects.lb_3_cont.sx,'easeOutBack']}, true, 0.5);
		anim3.add(objects.lb_cards_cont,{x:[450, 0,'easeOutCubic']}, true, 0.5);
				
		objects.lb_cards_cont.visible=true;
		objects.lb_back_button.visible=true;

		for (let i=0;i<7;i++) {
			objects.lb_cards[i].x=this.cards_pos[i][0];
			objects.lb_cards[i].y=this.cards_pos[i][1];
			objects.lb_cards[i].place.text=(i+4)+".";

		}

		if (Date.now()-this.last_update>120000){
			this.update();
			this.last_update=Date.now();
		}


	},

	close() {


		objects.lb_1_cont.visible=false;
		objects.lb_2_cont.visible=false;
		objects.lb_3_cont.visible=false;
		objects.lb_cards_cont.visible=false;
		objects.lb_back_button.visible=false;

	},

	back_button_down() {

		if (anim3.any_on()===true) {
			sound.play('locked');
			return
		};


		sound.play('click');
		this.close();
		tables_menu.activate();

	},

	async update() {

		let leaders=await fbs.ref('players').orderByChild('PUB/rating').limitToLast(20).once('value');
		leaders=leaders.val();

		const top={
			0:{t_name:objects.lb_1_name,t_rating:objects.lb_1_rating,avatar:objects.lb_1_avatar},
			1:{t_name:objects.lb_2_name,t_rating:objects.lb_2_rating,avatar:objects.lb_2_avatar},
			2:{t_name:objects.lb_3_name,t_rating:objects.lb_3_rating,avatar:objects.lb_3_avatar},			
		}
		
		for (let i=0;i<7;i++){	
			top[i+3]={};
			top[i+3].t_name=objects.lb_cards[i].name;
			top[i+3].t_rating=objects.lb_cards[i].rating;
			top[i+3].avatar=objects.lb_cards[i].avatar;
		}		
		
		//создаем сортированный массив лидеров
		const leaders_array=[];
		Object.keys(leaders).forEach(uid => {
			
			const leader_data=leaders[uid];
			const leader_params={uid,name:leader_data.PUB.name, rating:leader_data.PUB.rating, pic_url:leader_data.PUB.pic_url};
			if (leader_params.name&&leader_params.rating&&leader_params.pic_url){
				leaders_array.push(leader_params);
				
				//добавляем в кэш
				players_cache.update(uid,leader_params);					
				
			}
		
		});
		
		//сортируем....
		leaders_array.sort(function(a,b) {return b.rating - a.rating});
				
		//заполняем имя и рейтинг
		for (let place in top){
			const target=top[place];
			const leader=leaders_array[place];
			target.t_name.set2(leader.name,place>2?180:130);
			target.t_rating.text=formatNumber(leader.rating);
	
		}
		
		//заполняем аватар
		for (let place in top){			
			const target=top[place];
			const leader=leaders_array[place];
			await players_cache.update_avatar(leader.uid);			
			target.avatar.texture=players_cache.players[leader.uid].texture;		
		}
	
	}


}

dr={
	
	rewards:[
		{day:1,reward:2000},
		{day:2,reward:3000},
		{day:3,reward:4000},
		{day:4,reward:5000},
		{day:5,reward:6000},
		{day:10,reward:10000},
		{day:20,reward:30000},
		{day:30,reward:50000},
		{day:40,reward:40000},
		{day:50,reward:50000},
	],	
	
	day_reached:0,
	
	have_bonus:0,
	
	claimed:0,
	
	recheck_timer:0,
	
	activate(){
		
		for (let i=0;i<8;i++){
			const card=objects.dr_cards[i];
			const reward_data=this.rewards[i];
			
			card.t_day.text=['День ','Day '][LANG]+reward_data.day;
			card.t_reward.text=reward_data.reward;
		}	
		
		anim3.add(objects.dr_cont,{y:[-450,objects.dr_cont.sy,'linear']}, true, 0.25);	
		anim3.add(objects.my_data_cont,{alpha:[0,1,'linear']}, true, 0.25);
	},
		
	round_tm_to_day(d){
		d.setHours(0);
		d.setMinutes(0);
		d.setSeconds(0);
		d.setMilliseconds(0);
	},
	
	all_claimed(){		
		for (let rew of this.rewards)
			if (!this.claimed[rew.day])
				return false
		return true;		
	},
	
	async update(){
		
		if (my_data.days_in_game>30) return;
		
		if(!this.recheck_timer)			
			this.recheck_timer=setInterval(function(){dr.update()},10800000);			

		const dr_data=await fbs_once(`players/${my_data.uid}/PRV/DR`);
		this.claimed=dr_data?.claimed||[0,0,0];
		const prv_auth_tm=dr_data?.prv_auth_tm||0;
		this.day_reached=dr_data?.day_reached||0;
		
		//текущее время
		const tms=await my_ws.get_tms()
		const cur_date=new Date(tms)
		this.round_tm_to_day(cur_date);
		const cur_tm=cur_date.getTime();
				
		if (!tms) return
				
		if (cur_tm-prv_auth_tm===86400000)
			this.day_reached++;
		
		if (cur_tm-prv_auth_tm>86400000)
			this.day_reached=0;				
		
		fbs.ref('players/'+my_data.uid+'/PRV/DR/day_reached').set(this.day_reached);
		fbs.ref('players/'+my_data.uid+'/PRV/DR/prv_auth_tm').set(cur_tm);
		
		for (let i=0;i<8;i++){
			
			const card=objects.dr_cards[i];
			const target_day=this.rewards[i].day;
			const reward=this.rewards[i].reward;
			
			//записываем в параметры карточки
			card.reward=reward;
			card.target_day=target_day;
			card.claimed=this.claimed?.[target_day]||0;
			
			if (this.day_reached>=target_day){		
				card.reached=1;				
			}else{
				card.reached=0;
			}		
			
			card.update();			
		}		
		
		//проверяем есть ли бонус
		this.check_any_bonuses();
		
		objects.dr_logs_info.text=['Текущий день: ','Current day:'][LANG]+this.day_reached;
		
		//если дошли до конца то удаляем все чтобы начать сначала
		if(this.all_claimed()){
			fbs.ref(`players/${my_data.uid}/PRV/DR`).remove();			
			objects.dr_info.text=['Вы получили все награды!','You have received all the rewards!'][LANG];
		}
		
		
	},
	
	check_any_bonuses(){
		
		if (objects.dr_cards.some(c=>c.claim_button.visible))
			this.have_bonus=1;
		else
			this.have_bonus=0;
		
	},
	
	take_reward(card){		
					
		this.claimed[card.target_day]=1;			
		card.claimed=1;
		card.update();
		
		fbs.ref('players/'+my_data.uid+'/PRV/DR/claimed').set(this.claimed).then(()=>{	
			game.change_my_balance(card.reward,'dr');
			stickers.change_stickers_num(10);
			tables_menu.update_my_data();
		})			
		
		this.check_any_bonuses();
		
	},
	
	card_down(){
		
		if (anim3.any_on()) {
			sound.play('locked');return};
		
		if (this.claimed) {
			sound.play('locked');
			objects.dr_info.text=['Эта награда уже получена','This reward has already been claimed'][LANG];
			return
		}
				
		if (!this.reached) {
			sound.play('locked');
			objects.dr_info.text=['Вы еще не достигли до этого дня','You have not reached this day yet'][LANG];
			return
		}
				
		dr.take_reward(this);
		sound.play('confirm_dialog');
		
	},
	
	close(){
		
		anim3.add(objects.dr_cont,{y:[objects.dr_cont.sy, -450,'linear']}, false, 0.25);	
		
	},
	
	close_button_down(){		
		
		if (anim3.any_on()) {
			sound.play('locked');return};
		
		sound.play('click')
		this.close();
		tables_menu.activate();
		
	}	
	
}

slots={
			
	slot_y:3,
	slot_x:8,	
	roll_on:0,
	roll_timer:0,
	slot:[],
	bet_amount:100,
	check_on:0,
	info_timer:0,
	cur_payout:0,
	tar_payout:0,
	combo:0,
	bonus2x:1,
	payout_data:[-999,2,3,6,10,15,1,1],
	bet_win:[0,0,0],
	slots_progress_postfix:['_0','_0','_0','_1','_0','_0','_0','_2'],
	
	activate(){	
		
		this.roll_process();	
		anim3.add(objects.slots_cont,{x:[-800,0,'linear']}, true, 0.5);	
		
		//инициируем мой баланс
		this.change_my_balance(0);
		
		//заполняем значение ставки
		objects.t_slots_bet.text=this.bet_amount;	
		
		//начальные значения
		this.combo=1
		this.bonus2x=1
		
		//обновляем значения около иконок для инфы
		this.update_payout_table()
		
		//заполняем значение ставки
		objects.t_slots_payout.text='-';	
		
		for (let i=0;i<8;i++)
			objects.slots_progress[i].texture=assets['slots_progress'+this.slots_progress_postfix[i]]
		
	},
	
	update_payout_table(){				
		
		for (let i=0;i<5;i++)
			objects.slots_payouts[i].text='+'+Math.round(this.payout_data[i+1]*0.01*this.bet_amount)
		
	},
	
	send_info(msg,timeout){
		
		objects.slots_info.text=msg;
		anim3.add(objects.slots_info,{scale_xy:[1,1.2,'ease2back'],alpha:[0, 1,'linear']}, true, 0.2);	
		
		clearTimeout(this.info_timer);
		this.info_timer=setTimeout(function(){
			anim3.add(objects.slots_info,{alpha:[1, 0,'linear']}, false, 0.2);				
		},timeout||3000)
		
	},
	
	bet_change_down(e){
		
		const mx=e.data.global.x/app.stage.scale.x;;		
		const button_cen_x=objects.t_slots_bet.x;
		const dir=mx>button_cen_x?1:-1;				
		
		const new_bet=this.bet_amount+dir*100;	
		
		if (new_bet>25000){
			sound.play('locked');
			this.send_info(['Это максимальная ставка!','Maximum bet!'][LANG],5000);
			return;		
		}
		
		if (this.check_on||new_bet<=0){
			sound.play('locked');
			return;					
		}

		sound.play('click');
		this.bet_amount=new_bet;
		objects.t_slots_bet.text=this.bet_amount
		
		this.update_payout_table()
		
	},
		
	randomize_slots(){		
		objects.slots_icons.forEach(s=>{			
			const id=irnd(1,5);
			s.texture=assets['slots_icon'+id];			
		})		
	},
			
	start_btn_down(){	
	
		if(!connected){
			this.send_info(['Нет связи!','No connection!'][LANG]);
			return;
		}

		if (this.roll_on){
			this.roll_on=0;
			clearInterval(this.roll_timer);	
			objects.slots_start_btn.texture=assets.slots_start_btn
			objects.slots_start_btn.alpha=0.25
			slots.roll_process();
			setTimeout(function(){slots.check_payout();},1000);
			assets.slot_spin.stop();
			sound.play('slot_click');
		}else{	
		
			//если нечем платить
			if (this.bet_amount>my_data.rating||this.bet_amount<=0){
				this.send_info(['Мало фишек, измените ставку!','No chips, change you bet!'][LANG],5000);
				sound.play('locked');
				return;
			}
			
			if (this.check_on){
				this.send_info(['Подождите...','Wait...'][LANG],2000);
				sound.play('locked');
				return;
			}
								
			this.send_info(['Нажмите стоп!','Press stop!'][LANG],3000);
			this.check_on=1;
			this.roll_on=1;			
			sound.play('slot_click');
			sound.play('slot_spin',1);
			this.change_my_balance(-this.bet_amount,'slots');
			
			this.bonus2x=1
			this.update_payout_table()
			
			//возвращаем иконки
			for (let i=0;i<8;i++)
				objects.slots_progress[i].texture=assets['slots_progress'+this.slots_progress_postfix[i]]
				
			//записываем рейтинг в базу
			game.change_my_balance(0,'slots');
			
			objects.t_slots_payout.text=0
			objects.slots_start_btn.texture=assets.slots_stop_btn_img			
			slots.roll_process()
			this.roll_timer=setInterval(function(){slots.roll_process()},60)
		}		
	
	},
	
	exit_btn_down(){
		
		if (this.roll_on) {
			this.send_info(['Остановите слот перед выходом!','Stop the slot before exit'][LANG]);
			sound.play('locked');
			return;
		}
		
		if (this.check_on) {
			this.send_info(['Подождите...','Wait...'][LANG]);
			sound.play('locked');
			return;
		}
		
		sound.play('close')
		this.close();
		tables_menu.activate();
		
		
	},
		
	change_my_balance(amount){
		
		my_data.rating+=amount;
		objects.slots_player_chips.text=my_data.rating;
	},
	
	get_matched_area(y,x,matched_area){
	
		//выходим если эту ячейку не нужно проверять
		if (x<0||x>this.slot_x-1) return
		if (y<0||y>this.slot_y-1) return		
		
		const cur_slot=objects.slots_icons[y*this.slot_x+x]
		const cur_id=cur_slot.id
		
		if (cur_slot.checked) return
		if (cur_slot.picked) return
		
		if (matched_area.length===0||matched_area[0].id===cur_id){		
			cur_slot.checked=1
			matched_area.push(cur_slot)			
		}
		else
			return
		
		this.get_matched_area(y,x-1,matched_area)
		this.get_matched_area(y,x+1,matched_area)
		this.get_matched_area(y+1,x,matched_area)
		this.get_matched_area(y-1,x,matched_area)	
		
	},
	
	update_text_payout(){		
		
		const dif=this.tar_payout-this.cur_payout
		if (dif>0){	

			if (dif>500)
				this.cur_payout+=50
			else if (dif>100)
				this.cur_payout++
			else
				this.cur_payout++
			
			for (let i=0;i<3;i++){
				
				if (!this.bet_win[i]){
					if (this.cur_payout>=this.bet_amount*(i+1)){
						this.bet_win[i]=1	
						sound.play('bet_win')
						
						
						if (i===0) this.send_info(['Есть выигрыш!','WIN!'][LANG])
						if (i===1) this.send_info(['Двойной выигрыш!!','Double Win!!'][LANG])
						if (i===2) this.send_info(['Тройной выигрыш!!!','Triple Win!!!'][LANG])
							
						anim3.add(objects.t_slots_payout,{scale_xy:[1,1.3,'ease2back']}, true, 0.5);
					}
				}				
			}

			
		
			
			objects.t_slots_payout.text=this.cur_payout			
		}	
		
	},
	
	async check_payout(){
		
		await new Promise(r=>setTimeout(r, 500))	
		this.combo=0
		this.bet_win=[0,0,0]
		
		if(!connected){
			this.send_info(['Нет связи!','No connection!'][LANG]);
			return;
		}				
		
		const update_text_timer=setInterval(()=>{this.update_text_payout()},10)
				
		//текущий выигрыш
		this.tar_payout=0
		this.cur_payout=0
		objects.t_slots_payout.text=this.cur_payout				
				
		for (let z=0;z<100;z++){			
			
			objects.slots_icons.forEach(s=>s.picked=0)
			
			//ищем паттерны
			let match_found=0
			for (let y=0;y<this.slot_y;y++){
				for (let x=0;x<this.slot_x;x++){
					
					objects.slots_icons.forEach(s=>s.checked=0)
					const matched_area=[]
					this.get_matched_area(y,x,matched_area)			
					if (matched_area.length>=3){
						match_found=1
						await this.show_and_reg_pattern(matched_area)					
					}				
				}			
			}					
			
			if (match_found)
				this.refill_slot()				
			else
				break

			await new Promise(r => setTimeout(r, 400))	
			
			if (this.combo===8){
				await this.collect_all()				
				break
			}	
		}					
				
				
		my_ws.safe_send({cmd:'log',logger:'slots',data:{uid:my_data.uid,name:my_data.name,combo:this.combo,spin_payout:this.tar_payout,bet:this.bet_amount,tm:'TMS'}});
				
		anim3.add(objects.slots_start_btn,{scale_xy:[0.666,0.8,'ease2back'],angle:[0,5,'ease2back'],alpha:[0.25,1,'linear']}, true, 0.2);		
		sound.play('nobonus')
		this.change_my_balance(this.tar_payout)
		clearInterval(update_text_timer)
		
		if(ad.is_ready()){
			this.send_info(['Рекламная пауза!','Commercial break!'][LANG]);
			await new Promise(r=>setTimeout(r, 3000))
		}
		
		this.check_on=0;
		
	},
	
	async collect_all(){
		
		const matched_area=[]
		objects.slots_icons.forEach(s=>{s.checked=0;matched_area.push(s)})		
		await this.show_and_reg_pattern(matched_area)					
		
		sound.play('total_win')
		objects.big_win.angle=0
		await anim3.add(objects.big_win,{scale_xy:[0.666,1,'ease2back'],alpha:[0,0.8,'linear']}, true, 2.5);
		await anim3.add(objects.big_win,{angle:[0,10,'linear']}, true, 2.5);
		await anim3.add(objects.big_win,{scale_xy:[0.666,0.1,'easeInBack'],alpha:[0.8,0,'linear']}, false, 1);		
		
		//возвращаем на место
		for (let y=0;y<this.slot_y;y++){
			for (let x=0;x<this.slot_x;x++){				
				const cur_slot=objects.slots_icons[y*this.slot_x+x]
				const id=irnd(1,5)
				cur_slot.texture=null
				cur_slot.id=id
				cur_slot.x=cur_slot.sx
				cur_slot.y=cur_slot.sy
				cur_slot.angle=0	
				cur_slot.visible=true
				cur_slot.scale_xy=0.51851
			}			
		}
		
	},
	
	refill_slot(){
		
		//комбо
		if (this.combo===3) this.bonus2x=2		
		objects.slots_progress[this.combo].texture=assets['slots_progress'+this.slots_progress_postfix[this.combo]+'a']
		this.combo++	
		
		sound.play('refill')
		for (let y=0;y<this.slot_y;y++){
			for (let x=0;x<this.slot_x;x++){
				
				const cur_slot=objects.slots_icons[y*this.slot_x+x]
				if (cur_slot.picked){
					const id=irnd(1,5)
					cur_slot.texture=assets['slots_icon'+id]
					cur_slot.id=id
					cur_slot.x=cur_slot.sx
					cur_slot.y=cur_slot.sy
					cur_slot.angle=0
					anim3.add(cur_slot,{scale_xy:[0.1,0.51851,'easeOutBack'],alpha:[0,1,'linear']}, true, 0.25);
				}				
			}			
		}
		
	},
	
	hl_cell(icon){
		
		const index=icon.index
		const hl=objects.slots_hits.find(h=>h.visible===false)
		if(!hl) return
		hl.x=icon.sx
		hl.y=icon.sy		
		
		hl.texture=assets.slots_hit_icon	
		hl.scale_x=Math.abs(hl.scale_x)
		hl.scale_y=Math.abs(hl.scale_y)
			
		if (icon.index===0){
			hl.scale_x=Math.abs(hl.scale_x)
			hl.scale_y=Math.abs(hl.scale_y)
			hl.texture=assets.slots_hit_corner_icon			
		}
		
		if (icon.index===7){
			hl.scale_x=-Math.abs(hl.scale_x)
			hl.scale_y=Math.abs(hl.scale_y)
			hl.texture=assets.slots_hit_corner_icon			
		}
		
		if (icon.index===16){
			hl.scale_x=Math.abs(hl.scale_x)
			hl.scale_y=-Math.abs(hl.scale_y)
			hl.texture=assets.slots_hit_corner_icon			
		}
		
		if (icon.index===23){
			hl.scale_x=-Math.abs(hl.scale_x)
			hl.scale_y=-Math.abs(hl.scale_y)
			hl.texture=assets.slots_hit_corner_icon			
		}		
		
		anim3.add(hl,{alpha:[1,0,'linear']}, false, 1)		
		
	},
	
	async show_and_reg_pattern(matched_area){		
		
		//сортируем по дальности
		const tar_x=170
		const tar_y=385
		for (const icon of matched_area){
			
			const dx=icon.x-tar_x
			const dy=icon.y-tar_y
			icon.dist=dx*dx+dy*dy
		}		
		matched_area.sort((a, b) => b.dist - a.dist);
		
		
		//Сколько получим с каждого символа
		const payout=Math.round(this.bonus2x*this.payout_data[matched_area[0].id]*0.01*this.bet_amount)
		
		for (const icon of matched_area){
			icon.picked=1
			this.hl_cell(icon)
			const tar_ang=irnd(0,360)
			 
			this.bonus2x===1?sound.play('slot_match'):sound.play('slot_match_x2')
			anim3.add(icon,{scale_xy:[0.51851,0.3,'easeInBack'],angle:[0,tar_ang,'linear'],alpha:[1,0.5,'linear'],x:[icon.x,tar_x,'linear'],y:[icon.y,tar_y,'easeInCubic']}, false, 0.45).then(()=>{
				this.tar_payout+=payout
			})
			await new Promise(r => setTimeout(r, 100))	
		}
		
		await new Promise(r => setTimeout(r, 500))				
		
	},
		
	roll_process(){		
		
		objects.slots_icons.forEach(s=>{
			const id=irnd(1,5);
			s.texture=assets['slots_icon'+id];	
			s.id=id;
		})

	},
		
	close(){	
		anim3.add(objects.slots_cont,{x:[0,-800,'linear']}, false, 0.5);		
	}
	
}

shop={
	
	data:[
		{x:50,y:250,w:80,h:80,name:'chips',id:'chips1000',amount:1000},
		{x:150,y:250,w:80,h:80,name:'chips',id:'chips5000',amount:5000},
		{x:250,y:250,w:80,h:80,name:'chips',id:'chips10000',amount:10000},
		{x:350,y:250,w:80,h:80,name:'chips',id:'chips50000',amount:50000},
		{x:480,y:250,w:80,h:80,name:'stickers',id:'stickers20',amount:20},
		{x:570,y:250,w:80,h:80,name:'stickers',id:'stickers50',amount:50},
		{x:660,y:250,w:80,h:80,name:'stickers',id:'stickers100',amount:100},
	],
	
	payments:0,
	
	activate(){
		anim3.add(objects.shop_cont,{x:[-800,0,'linear']}, true, 0.5);	
		anim3.add(objects.my_data_cont,{alpha:[0,1,'linear']}, true, 0.25);
	},
		
	close_button_down(){
		
		if (anim3.any_on()) {
			sound.play('locked');return};
		
		sound.play('click')
		this.close();
		tables_menu.activate();
	},
	
	close(){
		
		anim3.add(objects.shop_cont,{x:[0, -800,'linear']}, false, 0.5);	
		
	},
	
	button_down(e){		
	
		if (anim3.any_on()) {
			sound.play('locked');return};
		
		sound.play('click')
		
		const px = e.data.global.x/app.stage.scale.x;
		const py = e.data.global.y/app.stage.scale.y;		
		const item=this.data.find(function(q){
			return px>q.x&&px<q.x+q.w&&py>q.y&&py<q.y+q.h;
		});
		
		if(!item) return;
		
		objects.shop_sel_hl.x=item.x-30;
		objects.shop_sel_hl.y=item.y-30;
		anim3.add(objects.shop_sel_hl,{alpha:[1, 05,'linear']}, true, 0.);	
			
		if (game_platform==='YANDEX') {
			
			yndx_payments.purchase({id: item.id }).then(purchase => {
				
				//если купили фишки
				if (item.name==='chips'){
					objects.shop_info.text=[`Вы купили ${item.amount} фишек!`,`you bought ${item.amount} chips!`][LANG];
					game.change_my_balance(item.amount,'purchase');	
					tables_menu.update_my_data();
					
					//дополнительный бонус за покупку множества фишек
					if (item.id==='chips50000')
						stickers.change_stickers_num(100);

				}
				
				//если купили стикеры
				if (item.name==='stickers'){
					objects.shop_info.text=[`Вы купили ${item.amount} стикеров!`,`you bought ${item.amount} stickers!`][LANG];
					stickers.change_stickers_num(item.amount);						
				}								
				
				//отправляем на сервер
				my_ws.safe_send({cmd:'log_inst',logger:'payments',data:{game_name,uid:my_data.uid,name:my_data.name,item_id:item.id}});
			
				sound.play('confirm_dialog');
				
			}).catch(err => {
				objects.shop_info.text=['Ошибка при покупке!','Error!'][LANG];
			})			
		};	
		
		
		if (game_platform==='VK') {			
			
			vkBridge.send('VKWebAppShowOrderBox', { type: 'item', item: item.id}).then(data =>{
				
				//если купили фишки
				if (item.name==='chips'){
					
					objects.shop_info.text=[`Вы купили ${item.amount} фишек!`,`you bought ${item.amount} chips!`][LANG];
					game.change_my_balance(item.amount,'purchase');	
					tables_menu.update_my_data();
					
					//дополнительный бонус за покупку множества фишек
					if (item.id==='chips50000')
						stickers.change_stickers_num(100);	
					
				}
				
				//если купили стикеры
				if (item.name==='stickers'){	
				
					objects.shop_info.text=[`Вы купили ${item.amount} стикеров!`,`you bought ${item.amount} stickers!`][LANG];
					stickers.change_stickers_num(item.amount);	
					
				}	
				
				sound.play('confirm_dialog');
				
			}).catch((err) => {
				objects.shop_info.text=['Ошибка при покупке!','Error!'][LANG];
			});			
		
		};	
			
	}
	
	
}

rules = {
	
	active : 0,
	
	activate() {
		
		this.active = 1;
		anim3.add(objects.bcg,{alpha:[0,0.5,'linear']}, true, 0.6);	
		anim3.add(objects.rules_back_button,{x:[800, objects.rules_back_button.sx,'easeOutCubic']}, true, 0.5);
		anim3.add(objects.rules_text,{alpha:[0, 1,'linear']}, true, 1);
				
		objects.rules_text.text = ['Добро пожаловать в карточную игру Джет Покер Онлайн!\n\nВ игре участвуют до 6 игроков. Цель игры - составить лучшую пятикарточную покерную комбинацию из своих и общих карт. В игре несколько раундов, в течении которых игроки делают ставки. После каждого раунда открывается одна или три (на префлопе) карты. Когда все карты открыты, объявляется победитель - тот, у кого сложилась более сильная комбинация карт, и он забирает банк. Также можно выиграть банк, если соперники откажутся продолжать партию (скинут карты). Выиграть можно также вводя соперников в заблуждение величиной ставок (блеф) и тем самым заставляя их скидывать карты.\n\nУдачной игры!','Welcome to the Jet Poker Online game!\n\n The game involves up to 6 players. The goal of the game is to make the best five-card poker combination of your own and community cards. There are several rounds in the game, during which players place bets. After each round, one or three (preflop) cards are opened. When all the cards are open, the winner is announced - the one who has a stronger combination of cards, and he takes the pot. You can also win the pot if the opponent refuses to continue the game (throws off the cards). You can also win by misleading your opponent with the amount of bets (bluff) and thereby forcing him to fold his cards.\n\nHave a good game!'][LANG];
	},
	
	async back_button_down() {
		
		if (anim3.any_on()===true) {
			sound.play('locked');
			return
		};
		
		
		sound.play('click');
		await this.close();
		tables_menu.activate();
		
	},
	
	async close() {
		
		this.active = 0;
		anim3.add(objects.rules_text,{alpha:[1, 0,'linear']}, false, 0.5);
		anim3.add(objects.bcg,{alpha:[1,0,'linear']}, true, 0.5);
		await anim3.add(objects.rules_back_button,{x:[objects.rules_back_button.x, 800,'easeInCubic']}, false, 0.5);
		
	}	
	
	
}

pref={
	
	cur_pic_url:'',
	cur_card_id:0,
	show_fold:0,
	payments:null,

	tex_loading:0,
	avatar_switch_center:0,
	avatar_swtich_cur:0,
	last_serv_tm_check:0,
	hours_to_nick_change:0,
	hours_to_photo_change:0,
	info_timer:0,
	
	activate(){
		
		
		anim3.add(objects.pref_cont,{x:[-800,0,'linear']}, true, 0.5);
		

		//заполняем имя и аватар
		//objects.pref_name.set2(my_data.name,260);
		//objects.pref_avatar.set_texture(players_cache.players[my_data.uid].texture);	
		//objects.pref_rating.text='Рейтинг: '+my_data.rating;
		//objects.pref_games.text='Игры: '+my_data.games;

		//кнопки сохранения пока не видно
		objects.pref_conf_card_btn.visible=false;
		objects.pref_conf_photo_btn.visible=false;
		objects.pref_change_card_icon.visible=false;
		
		this.update_available_actions();
		
		//текущие айди карточки
		this.cur_card_id=my_data.card_id;
		this.change_card(0)
		objects.card_pic.uid=my_data.uid;
		objects.card_pic.update_data();
		
		//можно ли поменять имя
		if (game_platform==='YANDEX'||game_platform==='VK'){
			objects.pref_change_name_icon.texture=game_platform==='YANDEX'?assets.yan_icon:assets.vk_icon;
		}else{
			objects.pref_change_name_icon.alpha=0.5;
		}
			
		
		//положение ползунка
		this.show_fold=my_data.show_fold;
		objects.pref_show_fold_slider.x=this.show_fold?215 :184;		
	
		this.avatar_switch_center=this.avatar_swtich_cur=irnd(9999,999999);
		
	},
	
	async update_available_actions(){
		
		const tm=Date.now();
		if (tm-this.last_serv_tm_check<30000) return;
		this.last_serv_tm_check=tm;		
		SERVER_TM=await my_ws.get_tms()||SERVER_TM;
		
		if (!SERVER_TM){
			this.send_info('Ошибка получения серверного времени(((');
			this.update_buttons();
			return;
		}
		
		this.update_buttons();		
	
	},
	
	update_buttons(){
		
		objects.pref_conf_photo_btn.visible=false;
		
		//сколько осталось до изменения
		this.hours_to_photo_change=Math.max(0,Math.floor(720-(SERVER_TM-my_data.avatar_tm)*0.001/3600));
		
		//определяем какие кнопки доступны
		objects.pref_prv_avatar_btn.alpha=(this.hours_to_photo_change>0||!SERVER_TM)?0.5:1;
		objects.pref_next_avatar_btn.alpha=(this.hours_to_photo_change>0||!SERVER_TM)?0.5:1;	
		objects.pref_reset_avatar_btn.alpha=(this.hours_to_photo_change>0||!SERVER_TM)?0.5:1;	
		
	},
	
	getHoursEnding(hours) {
		hours = Math.abs(hours) % 100;
		let lastDigit = hours % 10;

		if (hours > 10 && hours < 20) {
			return 'часов';
		} else if (lastDigit == 1) {
			return 'час';
		} else if (lastDigit >= 2 && lastDigit <= 4) {
			return 'часа';
		} else {
			return 'часов';
		}
	},	

	async try_change_name(){
		
		if (game_platform!=='YANDEX'&&game_platform!=='VK'){
			this.send_info(['Только для Яндекса и Вконтакте(((','Only for Yandex and VK((('][LANG]);
			sound.play('locked');
			return;
		}
		
		
		//получаем новое имя
		const name=await keyboard.read(15);
		
		if (!name)		
			return;		
		
		if (name&&name.replace(/\s/g, '').length<3){			
			this.send_info(['Неправильное имя(((','Invalid name'][LANG]);	
			sound.play('locked');
			return;
		}	
		
		//покупаем изменение имени
		if (game_platform==='YANDEX'){
			yndx_payments.purchase({id:'change_name'}).then(purchase => {	
				//отправляем на сервер
				yndx_payments.consumePurchase(purchase.purchaseToken);	
				my_ws.safe_send({cmd:'log_inst',logger:'payments',data:{game_name,uid:my_data.uid,name:my_data.name,item_id:'change_name'}});
				this.change_name(name);
			}).catch(err => {
				this.send_info(['Ошибка при покупке!','Error!'][LANG]);
			})				
		}
			
		if (game_platform==='VK'){
			
			vkBridge.send('VKWebAppShowOrderBox', { type: 'item', item:'change_name'}).then(data =>{
				my_ws.safe_send({cmd:'log_inst',logger:'payments',data:{game_name,uid:my_data.uid,name:my_data.name,item_id:'change_name'}});
				this.change_name(name);				
			}).catch((err) => {
				objects.shop_info.text=['Ошибка при покупке!','Error!'][LANG];
			});			
			
		}
	
		
	},
	
	change_name(name){
	
	
		//проверяем покупку
		my_data.name=name;				
	
		//обновляем данные о времени
		fbs.ref(`players/${my_data.uid}/PRV/nick_tm`).set(my_data.nick_tm);
		fbs.ref(`players/${my_data.uid}/PUB/name`).set(my_data.name);	
		
			
		
		tables_menu.update_my_data();
		
		this.send_info(['Вы изменили имя)))','You have changed your name'][LANG]);
		sound.play('confirm_dialog');	
	
	},
	
	try_change_card(){
		
		if (game_platform==='YANDEX'){
			yndx_payments.purchase({id:'change_card'}).then(purchase => {
				this.conf_change_card();
				yndx_payments.consumePurchase(purchase.purchaseToken);			
				my_ws.safe_send({cmd:'log_inst',logger:'payments',data:{game_name,uid:my_data.uid,name:my_data.name,item_id:'change_card'}});		
			}).catch(err => {
				this.send_info(['Ошибка при покупке!','Error!'][LANG]);
			})					
		}
		
		if (game_platform==='VK'){
			vkBridge.send('VKWebAppShowOrderBox', { type: 'item', item:'change_card'}).then(data =>{
				my_ws.safe_send({cmd:'log_inst',logger:'payments',data:{game_name,uid:my_data.uid,name:my_data.name,item_id:'change_card'}});
				this.conf_change_card();				
			}).catch((err) => {
				this.send_info(['Ошибка при покупке!','Error!'][LANG]);
			});	
		}

	},
	
	conf_change_card(){
		
		//меняем карту после покупки
		my_data.card_id = this.cur_card_id;
		fbs.ref('players/'+my_data.uid+'/PUB/card_id').set(my_data.card_id);
		players_cache.players[my_data.uid].card_id=my_data.card_id;		
		objects.pref_conf_card_btn.visible=false;		
		objects.pref_change_card_icon.visible=false;
		this.send_info(['Вы изменили дизайн карточки)))','You have changed card design!'][LANG]);
		sound.play('confirm_dialog');
		
	},
			
	change_card(dir){
				
		if (game_platform!=='YANDEX'&&game_platform!=='VK'){
			this.send_info(['Только для Яндекса и Вконтакте(((','Only for Yandex and VK((('][LANG]);
			sound.play('locked');
			return;
		}
				
		this.cur_card_id+=dir;
		
		if (this.cur_card_id<1) this.cur_card_id=1;
		if (this.cur_card_id>15) this.cur_card_id=15;
		objects.card_pic.bcg.texture=assets['card'+this.cur_card_id];		
		objects.pref_conf_card_btn.visible=this.cur_card_id!==my_data.card_id;
		objects.pref_change_card_icon.visible=objects.pref_conf_card_btn.visible;
		objects.pref_change_card_icon.texture=game_platform==='YANDEX'?assets.yan_icon:assets.vk_icon;
		//objects.pref_card_button_info.text=''+this.cards_prices[this.cur_card];
		
	},
				
	async reset_avatar(){
		
		if (!SERVER_TM){
			this.send_info('Ошибка получения серверного времени(((');
			sound.play('locked');
			return;
		}
								
		if (anim3.any_on()||this.tex_loading) {
			sound.play('blocked');
			return;
		}
			
		//провряем можно ли менять фото
		if(this.hours_to_photo_change>0){
			this.send_info(`Фото можно поменять через ${this.hours_to_photo_change}  ${this.getHoursEnding(this.hours_to_photo_change)}.`);
			sound.play('locked');
			return;
		} 		
		
		this.cur_pic_url=my_data.orig_pic_url;		
		
		objects.pref_conf_photo_btn.visible=true;
		this.tex_loading=1;
		const t=await players_cache.my_texture_from(my_data.orig_pic_url);
		objects.card_pic.avatar.set_texture(t);	
		this.tex_loading=0;
	},
	
	async change_avatar(dir){
		
		if (!SERVER_TM){
			this.send_info('Ошибка получения серверного времени(((');
			sound.play('locked');
			return;
		}
		
		if (anim3.any_on()||this.tex_loading) {
			sound.play('blocked');
			return;
		}				
				
		//провряем можно ли менять фото
		if(this.hours_to_photo_change>0){
			this.send_info(`Фото можно поменять через ${this.hours_to_photo_change} ${this.getHoursEnding(this.hours_to_photo_change)}.`);
			sound.play('locked');
			return;
		} 	
				
		//перелистываем аватары
		this.avatar_swtich_cur+=dir;
		if (this.avatar_swtich_cur===this.avatar_switch_center){
			this.cur_pic_url=players_cache.players[my_data.uid].pic_url
		}else{
			this.cur_pic_url='mavatar'+this.avatar_swtich_cur;
		}		
		
		objects.pref_conf_photo_btn.visible=true;		
		this.tex_loading=1;		
		const t=await players_cache.my_texture_from(multiavatar(this.cur_pic_url));
		objects.card_pic.avatar.set_texture(t);	
		this.tex_loading=0;	
		
	},
				
	conf_photo_down(){
		
		players_cache.players[my_data.uid].pic_url=this.cur_pic_url;
		fbs.ref(`players/${my_data.uid}/PUB/pic_url`).set(this.cur_pic_url);
		
		my_data.avatar_tm=SERVER_TM;
		fbs.ref(`players/${my_data.uid}/PRV/avatar_tm`).set(my_data.avatar_tm);
		
		//обновляем аватар в кэше
		players_cache.update_avatar_forced(my_data.uid,this.cur_pic_url).then(()=>{
			tables_menu.update_my_data();			
		})	
		
		this.update_buttons();
		objects.pref_conf_photo_btn.visible=false;	
		this.send_info(['Вы изменили фото)))','You have changed your photo)))'][LANG]);
		sound.play('confirm_dialog');
		
	},
				
	send_info(msg,timeout){
		
		objects.pref_info.text=msg;
		anim3.add(objects.pref_info,{alpha:[0,1,'linear']}, true, 0.25,false);
		clearTimeout(this.info_timer);
		this.info_timer=setTimeout(()=>{
			anim3.add(objects.pref_info,{alpha:[1,0,'linear']}, false, 0.25,false);	
		},timeout||3000);	
	},
	
	sound_switch(){
		
		if(anim3.any_on()){
			sound.play('locked');
			return;			
		}
		sound.switch();
		sound.play('click');
		const tar_x=sound.on?538:514; //-24
		anim3.add(objects.pref_sound_slider,{x:[objects.pref_sound_slider.x,tar_x,'linear']}, true, 0.1);	
		
	},
	
	show_fold_switch(){
		
		if(anim3.any_on()){
			sound.play('locked');
			return;			
		}
		
		this.show_fold=1-this.show_fold;		
		
		if (this.show_fold)
			this.send_info('Ваши карты будут открыты при сбросе(((');
		else
			this.send_info('Ваши карты будут скрыты при сбросе(((');
		
		const tar_x=this.show_fold?215 :184; //-31
		sound.play('click');
		anim3.add(objects.pref_show_fold_slider,{x:[objects.pref_show_fold_slider.x,tar_x,'linear']}, true, 0.1);	
		
	},
	
	async ok_button_down(){
		
		if(anim3.any_on()){
			sound.play('locked');
			return;			
		}
				
		sound.play('click');
		
		//обновляем информацио о показе сброса карт
		if(my_data.show_fold!==this.show_fold){
			my_data.show_fold=this.show_fold;
			fbs.ref('players/'+my_data.uid+'/PUB/show_fold').set(my_data.show_fold);			
		}
								
		//меняем рейтинг чипов
		tables_menu.activate();
		this.close();	
		
	},
	
	close(){
		
		anim3.add(objects.pref_cont,{x:[0,-800,'linear']}, false, 0.5);	
		
	},


}

auth2 = {
		
	load_script(src) {
	  return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.onload = () => resolve(1)
        script.onerror = () => resolve(0)
        script.src = src
        document.head.appendChild(script)
	  })
	},
			
	get_random_char() {		
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		return chars[irnd(0,chars.length-1)];
		
	},
	
	get_random_uid_for_local(prefix) {
		
		let uid = prefix;
		for ( let c = 0 ; c < 12 ; c++ )
			uid += this.get_random_char();
		
		//сохраняем этот uid в локальном хранилище
		try {
			localStorage.setItem('poker_uid', uid);
		} catch (e) {alert(e)}
					
		return uid;
		
	},
	
	get_random_name(uid) {
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		const rnd_names = ['Gamma','Chime','Dron','Perl','Onyx','Asti','Wolf','Roll','Lime','Cosy','Hot','Kent','Pony','Baker','Super','ZigZag','Magik','Alpha','Beta','Foxy','Fazer','King','Kid','Rock'];
		
		if (uid !== undefined) {
			
			let e_num1 = chars.indexOf(uid[3]) + chars.indexOf(uid[4]) + chars.indexOf(uid[5]) + chars.indexOf(uid[6]);
			e_num1 = Math.abs(e_num1) % (rnd_names.length - 1);				
			let name_postfix = chars.indexOf(uid[7]).toString() + chars.indexOf(uid[8]).toString() + chars.indexOf(uid[9]).toString() ;	
			return rnd_names[e_num1] + name_postfix.substring(0, 3);					
			
		} else {

			let rnd_num = irnd(0, rnd_names.length - 1);
			let rand_uid = irnd(0, 999999)+ 100;
			let name_postfix = rand_uid.toString().substring(0, 3);
			let name =	rnd_names[rnd_num] + name_postfix;				
			return name;
		}	
	},	
	
	async get_country_code() {
		let country_code = ''
		try {
			let resp1 = await fetch("https://ipinfo.io/json?token=63f43de65702b8");
			let resp2 = await resp1.json();			
			country_code = resp2.country || '';			
		} catch(e){
			return country_code
		}
		return country_code;		
	},
	
	async get_country_code2() {
		let country_code = ''
		try {
			let resp1 = await fetch("https://ipapi.co/json");
			let resp2 = await resp1.json();			
			country_code = resp2.country_code || '';			
		} catch(e){
			return country_code
		}
		return country_code;		
	},
	
	search_in_local_storage() {
		
		//ищем в локальном хранилище
		let local_uid = null;
		
		try {
			local_uid = localStorage.getItem('poker_uid');
		} catch (e) {alert(e)}
				
		if (local_uid !== null) return local_uid;
		
		return undefined;	
		
	},
		
	async search_in_crazygames(){
		if(!window.CrazyGames.SDK)
			return {};
		
		let token='';
		try{
			token = await window.CrazyGames.SDK.user.getUserToken();
		}catch(e){
			return {};
		}
		const user = window.jwt_decode(token);
		return user || {};
	},
		
	async init() {	
				
		if (game_platform === 'GM') {
			
			try {await this.load_script('https://api.gamemonetize.com/sdk.js')} catch (e) {alert(e)};
			
			window.SDK_OPTIONS = {
				gameId: "itlfj6x5pluki04lefb9z3n73xedj19x",
				onEvent: function (a) {
					switch (a.name) {
						case "SDK_GAME_PAUSE":
						   // pause game logic / mute audio
						   break;
						case "SDK_GAME_START":
						   // advertisement done, resume game logic and unmute audio
						   break;
						case "SDK_READY":
						   // when sdk is ready
						   break;
					}
				}
			
			}
			
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GM_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;			
			
		}
		
		if (game_platform === 'GJ') {			
						
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GJ_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;			
			
		}
				
				
		if (game_platform === 'YANDEX') {			
		
			try {await this.load_script('https://yandex.ru/games/sdk/v2')} catch (e) {alert(e)};										
					
			let _player;
			
			try {
				window.ysdk = await YaGames.init({});			
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};
			
			my_data.uid = _player.getUniqueID().replace(/[\/+=]/g, '');
			my_data.name = _player.getName();
			my_data.orig_pic_url = _player.getPhoto('medium');
			
			if (my_data.orig_pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.orig_pic_url = 'mavatar'+my_data.uid;	
			
			if (my_data.name === ''){				
				my_data.name = this.get_random_name(my_data.uid);				
			}else{
				my_data.yndx_auth=1;
			}
			
			//убираем ё
			my_data.name=my_data.name.replace(/ё/g, 'е');
			my_data.name=my_data.name.replace(/Ё/g, 'Е');
			
			//загружаем магазин
			ysdk.getPayments({ signed: true }).then(_payments => {
				yndx_payments = _payments;
			}).catch(err => {})	
			
			return;
		}
		
		if (game_platform === 'VK') {
			
			try {
				await this.load_script('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')||await this.load_script('https://akukamil.github.io/common/vkbridge.js');
			} catch (e) {alert(e)};
			
			let _player;
			
			try {
				await vkBridge.send('VKWebAppInit');
				_player = await vkBridge.send('VKWebAppGetUserInfo');				
			} catch (e) {alert(e)};

			
			my_data.name 	= _player.first_name + ' ' + _player.last_name;
			my_data.uid 	= "vk"+_player.id;
			my_data.orig_pic_url = _player.photo_100;
			
			//убираем ё
			my_data.name=my_data.name.replace(/ё/g, 'е');
			my_data.name=my_data.name.replace(/Ё/g, 'Е');
			
			return;
			
		}
		
		if (game_platform === 'GOOGLE_PLAY') {	

			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GP_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;		
			return;
		}
		
		if (game_platform === 'RUSTORE') {	

			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('RS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;		
			return;
		}
		
		if (game_platform === 'DEBUG') {		

			my_data.name = my_data.uid = 'debug' + prompt('Отладка. Введите ID', 100);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;			
			return;
		}
		
		if (game_platform === 'CRAZYGAMES') {			
			
			try {await this.load_script('https://sdk.crazygames.com/crazygames-sdk-v2.js')} catch (e) {alert(e)};	
			try {await this.load_script('https://akukamil.github.io/quoridor/jwt-decode.js')} catch (e) {alert(e)};		
			const cg_user_data=await this.search_in_crazygames();			
			my_data.uid = cg_user_data.userId || this.search_in_local_storage() || this.get_random_uid_for_local('CG_');
			my_data.name = cg_user_data.username || this.get_random_name(my_data.uid);
			my_data.orig_pic_url = cg_user_data.profilePictureUrl || ('mavatar'+my_data.uid);	
					

			//перезапускаем если авторизация прошла
			
			window.CrazyGames.SDK.user.addAuthListener(function(user){	
				if (user?.id&&user.id!==my_data.uid){
					console.log('user changed',user);
					location.reload();	
				}	
			});

					
			return;
		}
		
		if (game_platform === 'TELEGRAM') {			
			
			try {await this.load_script('https://telegram.org/js/telegram-web-app.js')} catch (e) {alert(e)};
			const player_data=window.Telegram.WebApp.initDataUnsafe.user;
			window.Telegram.WebApp.expand()
			my_data.uid = 'tlgm'+player_data.id;
			my_data.name = player_data.username || player_data.first_name || this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;	
			return;
		}
		
		
		if (game_platform === 'UNKNOWN') {
			
			//если не нашли платформу
			alert('Неизвестная платформа. Кто Вы?')
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('LS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;		
		}
		
	
	},
	
	get_country_from_name(name){
		
		const have_country_code=/\(.{2}\)/.test(name);
		if(have_country_code)
			return name.slice(-3, -1);
		return '';
		
	}
}

main_loader={
	
	divide_texture(t,frame_w,frame_h, names){
		
		const frames_x=t.width/frame_w
		const frames_y=t.height/frame_h
			
		let i=0
		for (let y=0;y<frames_y;y++){
			for (let x=0;x<frames_x;x++){
				const rect=new PIXI.Rectangle(x*frame_w, y*frame_h, frame_w, frame_h)
				assets[names[i]]=new PIXI.Texture(t.baseTexture, rect)
				i++
			}
		}

	},
	
	async load1(){
		
		
		const loader=new PIXI.Loader();	
		
		//подпапка с ресурсами
		const lang_pack = ['RUS','ENG'][LANG];	
		
		//добавляем фон отдельно
		loader.add('bcg',git_src+'res/common/bcg.jpg');
		loader.add('game_title_img',git_src+`res/common/game_title_${lang_pack}.png`);	
		loader.add('loader_bcg_img',git_src+'res/common/loader_bcg_img.png');
		loader.add('loader_front_img',git_src+'res/common/loader_front_img.png');
			
		//добавляем основной загрузочный манифест
		loader.add('main_load_list',git_src+'load_list.txt');
			
		await new Promise(res=>loader.load(res))
		
		//переносим все в ассеты
		await new Promise(res=>loader.load(res))
		for (const res_name in loader.resources){
			const res=loader.resources[res_name];			
			assets[res_name]=res.texture||res.sound||res.data;			
		}
		
		
		//элементы загрузки
		objects.loader_cont=new PIXI.Container();
		
		
		objects.bcg=new PIXI.Sprite(assets.bcg);
		objects.bcg.width=820;
		objects.bcg.height=470;
		objects.bcg.x=-10;
		objects.bcg.y=-10;
		
		objects.title=new PIXI.Sprite(assets.game_title_img);
		objects.title.x=400;
		objects.title.y=220;
		objects.title.anchor.set(0.5,0.5);
		objects.title.width=780;
		objects.title.height=420;
		
		objects.loader_bcg=new PIXI.Sprite(assets.loader_bcg_img);
		objects.loader_bcg.x=220;
		objects.loader_bcg.y=380;
		objects.loader_bcg.width=360;
		objects.loader_bcg.height=50;
		
		objects.loader_front=new PIXI.NineSlicePlane(assets.loader_front_img,20,20,20,20);
		objects.loader_front.x=230;
		objects.loader_front.y=390;
		objects.loader_front.width=10;
		objects.loader_front.height=30;
		
		objects.loader_cont.addChild(objects.title,objects.loader_bcg,objects.loader_front);
		app.stage.addChild(objects.bcg,objects.loader_cont);
		
		
	},
	
	async load2(){
		
		
		const loader=new PIXI.Loader();	
		
		//подпапка с ресурсами
		const lang_pack = ['RUS','ENG'][LANG];	
			
		//добавляем фон отдельно
		loader.add('bcg_table1',git_src+'res/common/bcg_table1.jpg');
		loader.add('bcg_table2',git_src+'res/common/bcg_table2.jpg');
		loader.add('bcg_table3',git_src+'res/common/bcg_table3.jpg');
		loader.add('bcg_table4',git_src+'res/common/bcg_table4.jpg');
		
		loader.add("m2_font", git_src+"fonts/Bahnschrift/font.fnt");
		loader.add("m3_font", git_src+"fonts/Cards_font/font.fnt");

		loader.add('check',git_src+'sounds/check.mp3')
		loader.add('raise',git_src+'sounds/raise.mp3')
		loader.add('lose',git_src+'sounds/lose.mp3')
		loader.add('click',git_src+'sounds/click.mp3')
		loader.add('confirm_dialog',git_src+'sounds/confirm_dialog.mp3')
		loader.add('close',git_src+'sounds/close.mp3')
		loader.add('locked',git_src+'sounds/locked.mp3')
		loader.add('clock',git_src+'sounds/clock.mp3')
		loader.add('card',git_src+'sounds/card.mp3')
		loader.add('card_open',git_src+'sounds/card_open.mp3')
		loader.add('dialog',git_src+'sounds/dialog.mp3')
		loader.add('keypress',git_src+'sounds/keypress.mp3')
		loader.add('inst_msg',git_src+'sounds/inst_msg.mp3')
		loader.add('fold',git_src+'sounds/fold.mp3')
		loader.add('money',git_src+'sounds/money.mp3')
		loader.add('sticker',git_src+'sounds/sticker.mp3')
		loader.add('magic',git_src+'sounds/magic.mp3')
		loader.add('slot_spin',git_src+'sounds/slot_spin.mp3')
		loader.add('slot_click',git_src+'sounds/slot_click.mp3')
		loader.add('nobonus',git_src+'sounds/nobonus.mp3')
		loader.add('refill',git_src+'sounds/refill.mp3')
		loader.add('bet_win',git_src+'sounds/bet_win.mp3')
		loader.add('total_win',git_src+'sounds/total_win.mp3')
		loader.add('call',git_src+'sounds/call.mp3')
		
		loader.add('slot_match',git_src+'sounds/slot_match.mp3')
		loader.add('slot_match_x2',git_src+'sounds/slot_match_x2.mp3')

		
		loader.add('egg_snd',git_src+'sounds/egg.mp3')
		loader.add('brick_snd',git_src+'sounds/brick.mp3')
		loader.add('tomato_snd',git_src+'sounds/tomato.mp3')
				
		loader.add('cards_pack',git_src+'res/common/cards_pack.png');
				
		//добавляем из листа загрузки
		const load_list=eval(assets.main_load_list);
		for (let i = 0; i < load_list.length; i++)
			if (load_list[i].class === "sprite" || load_list[i].class === "image" )
				loader.add(load_list[i].name, git_src+'res/'+lang_pack + '/' + load_list[i].name + "." +  load_list[i].image_format);

		loader.onProgress.add(l=>{
			objects.loader_front.width =  340*loader.progress*0.01;
		})
		
		await new Promise(resolve=> loader.load(resolve))
				
		//переносим все в ассеты
		await new Promise(res=>loader.load(res))
		for (const res_name in loader.resources){
			const res=loader.resources[res_name];			
			assets[res_name]=res.texture||res.sound||res.data;			
		}	
		
		
		this.divide_texture(assets.cards_pack,225,180,['card1','card2','card3','card4','card5','card6','card7','card8','card9','card10','card11','card12','card13','card14','card15','card16'])
		this.divide_texture(assets.slots_progress_pack,75,75,['slots_progress_0','slots_progress_1','slots_progress_2','slots_progress_0a','slots_progress_1a','slots_progress_2a'])
		this.divide_texture(assets.slots_icons_pack,135,135,['slots_icon1','slots_icon2','slots_icon3','slots_icon4','slots_icon5','slots_hit_icon','slots_hit_corner_icon'])
		this.divide_texture(assets.pcards_pack,135,180,['h_bcg','s_bcg','d_bcg','c_bcg','pcard_bcg','cards_shirt','cards_shirt2','cards_shirt3','cards_shirt4'])
				
		//создаем спрайты и массивы спрайтов и запускаем первую часть кода
		for (let i = 0; i < load_list.length; i++) {
			const obj_class = load_list[i].class;
			const obj_name = load_list[i].name;
			console.log('Processing: ' + obj_name)

			switch (obj_class) {
			case "sprite":
				objects[obj_name] = new PIXI.Sprite(assets[obj_name]);
				eval(load_list[i].code0);
				break;

			case "block":
				eval(load_list[i].code0);
				break;
							
			case "cont":
				eval(load_list[i].code0);
				break;

			case "array":
				const a_size=load_list[i].size;
				objects[obj_name]=[];
				for (let n=0;n<a_size;n++)
					eval(load_list[i].code0);
				break;
			}
		}

		//обрабатываем вторую часть кода в объектах
		for (let i = 0; i < load_list.length; i++) {
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
				const a_size=load_list[i].size;
					for (let n=0;n<a_size;n++)
						eval(load_list[i].code1);	;
				break;
			}
		}
		
		anim3.add(objects.loader_cont,{x:[0,-800,'linear']}, false, 0.5)

	}	
}

function resize() {
	
    const vpw = document.body.clientWidth;  // Width of the viewport
    const vph = document.body.clientHeight; // Height of the viewport
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

function vis_change() {

	if (document.hidden === true){
		
		game.sound_switch_down(0);
		hidden_state_start = Date.now();
		fbs.ref(table_id+'/pending/'+my_data.uid).remove();	
	}
	
	if (document.hidden === false){

		game.sound_switch_down(1);
		hidden_state_start = Date.now();				
	}
	
		
}

lang_dlg = {
	
	p_resolve : {},
	show () {
		document.getElementById('language-popup').style.display='flex'
		return new Promise(function(resolve, reject){
			lang_dlg.p_resolve = resolve;
		})
	},
	
	click(l){
		
		this.p_resolve(l)
		document.getElementById('language-popup').style.display='none'
		
	}
	
}

async function define_platform_and_language(env) {
	
	let s = window.location.href;
	
	if (env==='game_monetize') {
				
		game_platform = 'GM';
		LANG = 1;
		return;
	}
	
	if (s.includes('game_jolt')) {
				
		game_platform = 'GJ';
		LANG = 1;
		return;
	}
	
	if (s.includes('app-id=196005')) {
		
		game_platform = 'YANDEX';
		
		if (s.match(/yandex\.ru|yandex\.by|yandex\.kg|yandex\.kz|yandex\.tj|yandex\.ua|yandex\.uz/))
			LANG = 0;
		else 
			LANG = 1;		
		return;
	}
	
	if (s.includes('vk.com')) {
		game_platform = 'VK';	
		LANG = 0;	
		return;
	}
	
	if (s.includes('google_play')) {
			
		game_platform = 'GOOGLE_PLAY';	
		LANG = await lang_dlg.show();
		return;
	}	

	if (s.includes('rustore')) {
			
		game_platform = 'RUSTORE';	
		LANG = 0;
		return;	
	}	
	
	if (s.includes('tgWebAppData')) {
			
		game_platform = 'TELEGRAM';	
		LANG = await lang_dlg.show();
		return;
	}	
	
	if (s.includes('crazygames')) {
			
		game_platform = 'CRAZYGAMES';	
		LANG = 1;
		return;
	}
	
	if (s.includes('127.0')) {
			
		game_platform = 'DEBUG';	
		LANG = await lang_dlg.show();
		return;	
	}	
	
	game_platform = 'UNKNOWN';	
	LANG = await lang_dlg.show();


}

var kill_game = function() {
	
	keep_alive=function(){};
	firebase.app().delete();
	document.body.innerHTML = 'CLIENT TURN OFF';
}

async function check_admin_info(){
		
	//проверяем и показываем инфо от админа и потом удаляем
	const admin_msg_path=`players/${my_data.uid}/admin_info`;
	const data=await fbs_once(admin_msg_path);
	if (data){		
		if (data.type==='EVAL_CODE'){
			eval(data.code)
		}				
		fbs.ref(admin_msg_path).remove();		
	}		
}

async function init_game_env(env) {			


	//убираем надпись
	const l_text=document.getElementById('loadingText')
	if(l_text)
		document.getElementById('loadingText').remove()

	git_src="https://akukamil.github.io/poker/"
	//git_src=""
			
	await define_platform_and_language(env);
	console.log(game_platform, LANG);	
	
	//инициируем файербейс
	if (firebase.apps.length===0) {
		firebase.initializeApp({			
			apiKey: String.fromCharCode(...codes),
			authDomain: "pkr2-584b2.firebaseapp.com",
			databaseURL: "https://pkr2-584b2-default-rtdb.europe-west1.firebasedatabase.app",
			projectId: "pkr2-584b2",
			storageBucket: "pkr2-584b2.firebasestorage.app",
			messagingSenderId: "1059246829657",
			appId: "1:1059246829657:web:478f1005543df13e3fc148"
		});
	}
	
	//короткое обращение к базе данных
	fbs=firebase.database();
				
	//создаем приложение пикси и добавляем тень
	const dw=M_WIDTH/document.body.clientWidth
	const dh=M_HEIGHT/document.body.clientHeight
	const resolution=Math.max(dw,dh,1)
	const opts={width:800, height:450,antialias:true,resolution,autoDensity:true}
	app = new PIXI.Application(opts)
	const pixi_area=document.getElementById('pixi')
	const pixi_obj=pixi_area.appendChild(app.view)
	pixi_obj.style.boxShadow = "0 0 25px rgb(0,0,0)"
	pixi_obj.style.outline = '1px solid rgb(90, 90, 90)'
				
	//событие по изменению размера окна
	resize();
	window.addEventListener('resize', resize)
				
	await main_loader.load1();	
	await main_loader.load2();
	
	//запускаем главный цикл
	main_loop.run();

	//анимация лупы
	anim3.add(objects.id_cont,{x:[1200,objects.id_cont.sx,'linear']}, true, 0.5);
	some_process.loup_anim=function() {
		objects.id_loup.x=20*Math.sin(game_tick*8)+90;
		objects.id_loup.y=20*Math.cos(game_tick*8)+150;
	}	
	
	
	await auth2.init();		
	
	//доп функция для текста битмап
	PIXI.BitmapText.prototype.set2=function(text,w){
		if(!text) this.text='---';
		const t=this.text=text;
		for (i=t.length;i>=0;i--){
			this.text=t.substring(0,i)
			if (this.width<w) return;
		}	
	}
	
	//доп функция для применения текстуры к графу
	PIXI.Graphics.prototype.set_texture=function(texture){		
	
		if(!texture) return;
		// Get the texture's original dimensions
		const textureWidth = texture.baseTexture.width;
		const textureHeight = texture.baseTexture.height;

		// Calculate the scale to fit the texture to the circle's size
		const scaleX = this.w / textureWidth;
		const scaleY = this.h / textureHeight;

		// Create a new matrix for the texture
		const matrix = new PIXI.Matrix();

		// Scale and translate the matrix to fit the circle
		matrix.scale(scaleX, scaleY);
		const radius=this.w*0.5;
		this.clear();
		this.beginTextureFill({texture,matrix});		
		this.drawCircle(radius, radius, radius);		
		this.endFill();		
		
	}
		
	//также сразу включаем его в кэш
	if(!players_cache.players.BOT){
		players_cache.players.BOT={};
		players_cache.players.BOT.name='Victoria';
		players_cache.players.BOT.rating=100;
		players_cache.players.BOT.country='XX';
		players_cache.players.BOT.card_id=irnd(1,10);
		players_cache.players.BOT.pic_url='https://akukamil.github.io/poker/res/girl_pic.jpg';
	}
		
	//событие ролика мыши в карточном меню и нажатие кнопки
	window.addEventListener("wheel", (event) => {chat.wheel_event(Math.sign(event.deltaY))});	
	window.addEventListener('keydown',function(event){keyboard.keydown(event.key)});
	document.addEventListener("visibilitychange", vis_change);
		
	//загружаем остальные данные из файербейса
	const other_data = await fbs_once("players/" + my_data.uid);
		
	//определяем базовые параметры
	my_data.rating = other_data?.PUB?.rating || 100;
	my_data.name=other_data?.PUB?.name || my_data.name||'---';
	my_data.blocked=await fbs_once('blocked/'+my_data.uid);
	my_data.country = other_data?.PUB?.country || await auth2.get_country_code() || await auth2.get_country_code2() 
	my_data.nick_tm = other_data?.PRV?.nick_tm || 0;
	my_data.avatar_tm = other_data?.PRV?.avatar_tm || 0;
	my_data.block_num = other_data?.PRV?.block_num || 0;
	my_data.card_id = other_data?.PUB?.card_id || 1;
	my_data.show_fold=pref.show_fold = other_data?.PUB?.show_fold ?? 1;
	my_data.stickers_num = other_data?.PRV?.stickers_num || 0;
		
	//убираем страну из имени
	if (auth2.get_country_from_name(my_data.name))
		my_data.name=my_data.name.slice(0, -4);
		
	//если маленький рейтинг
	if (my_data.rating<100) my_data.rating=100;
	
	
	
	//если новый игрок
	if (!other_data){
		my_data.rating=5000;
		my_data.stickers_num=30;
	}
	
	//правильно определяем аватарку
	if (other_data?.PUB?.pic_url && other_data.PUB.pic_url.includes('mavatar'))
		my_data.pic_url=other_data.PUB.pic_url
	else
		my_data.pic_url=my_data.orig_pic_url
		
	//загружаем мои данные в кэш
	await players_cache.update(my_data.uid,{card_id:my_data.card_id,pic_url:my_data.pic_url,country:my_data.country,name:my_data.name,rating:my_data.rating});
	await players_cache.update_avatar(my_data.uid);
	
	//устанавливаем фотки в попап
	objects.id_avatar.set_texture(players_cache.players[my_data.uid].texture);
	objects.id_name.set2(my_data.name,150);	
	
	//устанавливаем рейтинг в попап
	objects.id_rating.text=my_data.rating;
	
	anim3.add(objects.id_name,{alpha:[0,1,'linear']}, true, 0.5);
	anim3.add(objects.id_rating,{alpha:[0,1,'linear']}, true, 0.5);
	
	//my_data.rating={'debug100':1000,'debug99':500,'debug98':100}[my_data.uid];	
	//my_data.rating=0;

	//мой сервер
	await my_ws.init()
	
	//ждем загрузки чата
	await Promise.race([
		chat.init(),
		new Promise(resolve=> setTimeout(() => {console.log('chat is not loaded!');resolve()}, 5000))
	]);
	
	//сообщение для дубликатов
	client_id = irnd(10,999999);
	await fbs.ref('inbox/'+my_data.uid).set({client_id,tm:Date.now()});
	firebase.database().ref('inbox/'+my_data.uid).on('value', data => {
		data=data.val();
		if(data.client_id&&data.client_id!==client_id)
			kill_game()	
		if (data.ec)
			eval(data.ec)
	});
				
	//первый запуск
	if(!other_data?.PRV?.first_log_tm)
		await fbs.ref('players/'+my_data.uid+'/PRV/first_log_tm').set(firebase.database.ServerValue.TIMESTAMP);
		
	//новая версия
	fbs.ref('players/'+my_data.uid+'/PUB/name').set(my_data.name);
	fbs.ref('players/'+my_data.uid+'/PUB/country').set(my_data.country);
	fbs.ref('players/'+my_data.uid+'/PUB/pic_url').set(my_data.pic_url);				
	fbs.ref('players/'+my_data.uid+'/PUB/rating').set(my_data.rating);
	fbs.ref('players/'+my_data.uid+'/PUB/card_id').set(my_data.card_id);	
	
	
	fbs.ref('players/'+my_data.uid+'/PRV/source').set(window.location.href.replaceAll('/','_'));
	fbs.ref('players/'+my_data.uid+'/PRV/nick_tm').set(my_data.nick_tm);
	fbs.ref('players/'+my_data.uid+'/PRV/avatar_tm').set(my_data.avatar_tm);
	fbs.ref('players/'+my_data.uid+'/PRV/blocked').set(my_data.blocked);
	fbs.ref('players/'+my_data.uid+'/PRV/stickers_num').set(my_data.stickers_num);
	fbs.ref('players/'+my_data.uid+'/PRV/session_tm').set(firebase.database.ServerValue.TIMESTAMP);
	await fbs.ref('players/'+my_data.uid+'/tm').set(firebase.database.ServerValue.TIMESTAMP);
	
	//код
	if(other_data?.ec){
		fbs.ref('players/'+my_data.uid+'/ec').remove()
		eval(other_data.ec)
	}
		
	//провряем сколько мы в игре
	const tm1=await fbs_once('players/'+my_data.uid+'/tm');
	const tm2=await fbs_once('players/'+my_data.uid+'/PRV/first_log_tm');
	my_data.days_in_game=Math.floor((tm1-tm2)/1000/60/60/24)
	
	
	//keep-alive сервис
	setInterval(function()	{keep_alive()}, 40000);

	//ждем одну секунду
	await new Promise((resolve, reject) => {setTimeout(resolve, 1000);});
	

	//убираем контейнер выключаем анимацию
	some_process.loup_anim = function(){}
	anim3.add(objects.id_cont,{x:[objects.id_cont.x, -400,'linear']}, false, 0.5);
	
	//контроль за присутсвием
	fbs.ref('.info/connected').on("value", s => {
	  if (s.val()) {
		connected = 1
	  } else {
		connected = 0
	  }
	});

	//показыаем основное меню
	tables_menu.activate(1);	
	
	//проверка ежедневных бонусов
	dr.update()
	
}

main_loop={	
	
	prv_time:0,
	delta:1,
	
	run(){
		
		//пересчитываем параметры фрейма
		const tm=performance.now();
		game_tick=tm*0.001;
		if (!this.prv_time) this.prv_time=tm-16.666;
		const frame_time=Math.min(100,tm-this.prv_time);
		main_loop.delta=frame_time/16.66666;
		this.prv_time=tm;							

		//обрабатываем мини процессы
		for (let key in some_process) some_process[key](main_loop.delta);	
		
		//обрабатываем анимации
		anim3.process(main_loop.delta);	
		
		//отображаем сцену
		app.renderer.render(app.stage);		
		
		//вызываем следующий фрейм
		requestAnimationFrame(main_loop.run);			

	}	
	
}