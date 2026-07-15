/* GA4 Common JS */
$(document).ready(function(){
	/** 
	 * 메인 (2023-07-26 리뉴얼)
	 */
	//상단메뉴
	$(document).on("click", ".wrap-main-category .inner-main-category .swiper-slide", function(){    
		let categoryName = $(this).find("a").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "상단메뉴", "상단메뉴_카테고리", categoryName);		
	});

	// 20260309 수정
	// $(document).on("click", ".wrap-main-category .list-main-category a", function(){
	// 	var menuNm = $(this).find('span').text().replace(/\s/g, "")
	// 	GA_Event("click_MO_영문_메인", "상단메뉴", "상단메뉴_카테고리", menuNm);
	// });
	$(document).on("click", ".list-main-category a", function() {
		var idx = $(this).closest('li').index();
		var menuNm = $(this).data("dispnm").replace(/\s/g, "");
		var area2 = "";

		if (idx < 4) {
			area2 = "GNB_공통";
		} else {
			area2 = "GNB_행사";
		}

		GA_Event("click_PC_영문_공통", "GNB", area2, menuNm);
	});

	//메인배너 (2023-07-26 수정)
	$(document).on("click", ".area-visual .box-visual .swiper-slide", function(){    
		if($(this).find("img").length){
			let bannerNameImg = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_PC_영문_메인", "메인배너", "메인배너", "배너_"+bannerNameImg);
		}
		else if($(this).find("video").length){
			var bannerNameVideo = $(this).find("video").attr("alt").replace(/\s/g, "");
			GA_Event("click_PC_영문_메인", "메인배너", "메인배너", "배너_"+bannerNameVideo);
		}		
	});

	//큐레이션, 상단배너, 좌측배너 추가 2023 개선 : 20231212
	$(document).on("click", ".area-personal-link .personal-info a", function(){
		let personalText = $(this).text().replace(/\s/g, ""); 
		GA_Event("click_PC_영문_메인", "띠배너", "띠배너", "배너_"+personalText);
	});
	// 20260309 수정
	$(document).on("click", ".main__top-layer .contents a", function(){
		let bannerText = $(this).data("dispnm").replace(/\s/g, ""); 
		GA_Event("click_PC_영문_메인", "상단배너", "상단배너", "배너_"+bannerText);
	});
	$(document).on("click", ".main__side-layer .contents a", function(){
		let imgText = $(this).find(".main-txt").text().replace(/\s/g, ""); 
		GA_Event("click_PC_영문_메인", "좌측배너", "좌측배너", "배너_"+imgText);
	});

	// 대시보드 20260427 추가
	$(document).on("click", ".main__dashboard a", function(){
		let menuNm = $(this).find('.main__dashboard--tit').text().replace(/\s/g, ""); 
		GA_Event("click_PC_영문_메인", "대시보드", "대시보드_메뉴", "메뉴_"+menuNm);
	});

	//브랜드, 발견의 순간 20260427 추가
	$(document).on("click", ".brand-finder .tab-brandfinder li button", function(){
		let tabNm = $(this).text().replace(/\s/g, ""); 
		GA_Event("click_PC_영문_메인", "브랜드홍보", "브랜드홍보_탭", "탭_"+tabNm);
	});

	$(document).on("click", ".brand-finder .brand-finder-img a", function(){
		let tabNm = $(this).parents('.brand-finder').find('.tab-brandfinder li.is-active button').text().replace(/\s/g, ""); 
		GA_Event("click_PC_영문_메인", "브랜드홍보", "브랜드홍보_메인배너", tabNm);
	});

	$(document).on("click", ".brand-finder .brand-finder-body ul li a", function(){
		let prdNm = $(this).closest('li').data("goosnm").replace(/\s/g, ""); 
		GA_Event("click_PC_영문_메인", "브랜드홍보", "브랜드홍보_상품", "상품_"+prdNm);
	});

	//테마형 상품 20260427 추가
	$(document).on("click", ".main-themeproduct .box-tit a", function(){
		let $targetSection = $(this).closest('.main-themeproduct');
		let index = $('.main-themeproduct').index($targetSection)+1;
		let themNm = $(this).text().replace(/\s/g, ""); 
		GA_Event("click_PC_영문_메인", "테마형_"+index, "테마형_"+index+"_"+themNm, "전체보기");
	});

	$(document).on("click", ".main-themeproduct .swiper__main-themeproduct ul li a", function(){
		let $targetSection = $(this).closest('.main-themeproduct');
		let index = $('.main-themeproduct').index($targetSection)+1;
		let themNm = $(this).closest('.main-themeproduct').find('.box-tit a').text().replace(/\s/g, ""); 
		let prdNm = $(this).find('.product__brand-info').text().replace(/\s/g, ""); 
		GA_Event("click_PC_영문_메인", "테마형_"+index, "테마형_"+index+"_"+themNm, "상품_" + prdNm);
	});

	//새로운 브랜드 소개 20260427 추가
	$(document).on("click", ".main-newbrand .main-newbrand-head a", function(){
		GA_Event("click_PC_영문_메인", "신규입점", "신규입점_브랜드", "더보기");
	});

	$(document).on("click", ".main-newbrand .product__list li a", function(){
		let prdNm = $(this).closest('li').data("goosnm").replace(/\s/g, ""); 
		GA_Event("click_PC_영문_메인", "신규입점", "신규입점_브랜드", "상품_"+prdNm);
	});

	//오늘의 특가
	$(document).on("click", ".main-content .special-price .box-tit a", function(){
		GA_Event("click_PC_영문_메인", "오늘의특가", "오늘의특가", "더보기");		
	});
	$(document).on("click", ".main-content .special-price .area-tab ul.tab-special-price li", function(){   
		let tabName = $(this).find("button").text().replace(/\s/g, ""); 
		GA_Event("click_PC_영문_메인", "오늘의특가", "오늘의특가", "탭_"+tabName);		
	});
	$(document).on("click", ".main-content .special-price .area-tab #special-price--1 ul li", function(){   
		let productName = $(this).find(".product__brand-info").text().replace(/\s/g, ""); 
		GA_Event("click_PC_영문_메인", "오늘의특가", "오늘의특가_특가상품", "상품_"+productName);		
	});
	$(document).on("click", ".main-content .special-price .area-tab #special-price--2 ul li", function(){   
		let brandName = $(this).find(".product__img--logo img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "오늘의특가", "오늘의특가_특가브랜드", "브랜드_"+brandName);
	}); 

	// 당신을 위한 상품 추천
	$(document).on("click", ".main-content .ai-recommend .list-product__searchlist li .product__link", function(){
		let prodText = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "상품추천", "상품_"+prodText, "바로가기");
	});
	$(document).on("click", ".main-content .ai-recommend .list-product__searchlist li .btn-cart", function(){
		let prodText = $(this).parents(".product__link").find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "상품추천", "상품_"+prodText, "장바구니 담기");
	});

	//베스트셀러
	$(document).on("click", ".main-content .main-bestseller .box-tit a", function(){
		GA_Event("click_PC_영문_메인", "베스트셀러", "베스트셀러", "더보기");
	});
	$(document).on("click", ".main-content .main-bestseller .link-bast__go a", function(){
		let cateText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "베스트셀러", "베스트셀러", cateText);
	});
	$(document).on("click", ".main-content .main-bestseller .tab-bastseller button", function(){
		let cateText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "베스트셀러", "베스트셀러_탭", "탭_"+cateText);
	});
	$(document).on("click", ".main-content .main-bestseller .list-product__searchlist li a", function(){
		let cateText = $(".main-content .main-bestseller .tab-bastseller .is-active button").text().replace(/\s/g, "");
		let prodText = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "베스트셀러", "베스트셀러_탭_"+cateText, "상품_"+prodText);
	});
	$(document).on("click", ".main-content .main-bestseller .list-product__searchlist li .btn-cart", function(){
		let cateText = $(".main-content .main-bestseller .tab-bastseller .is-active button").text().replace(/\s/g, "");
		let prodText = $(this).parents(".product__item").find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "베스트셀러", "베스트셀러_탭_"+cateText, "장바구니 담기_"+prodText);
	});

	//첫구매딜
	$(document).on("click", ".main-content .first-deal .box-tit a", function(){
		GA_Event("click_PC_영문_메인", "첫구매딜", "첫구매딜", "더보기");
	});
	$(document).on("click", ".main-content .first-deal .swiper__first-deal .product__item a", function(){
		let prodText = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "첫구매딜", "첫구매딜_상품_"+prodText, "바로가기");
	});
	$(document).on("click", ".main-content .first-deal .swiper__first-deal .product__item .btn-cart", function(){
		let prodText = $(this).parents(".product__item").find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "첫구매딜", "첫구매딜_상품_"+prodText, "장바구니 담기");
	});

	//쇼핑혜택
	$(document).on("click", ".main-content .customer-benefit .wrap-tit ul li", function(){    
		let tabName = $(this).find("button").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "쇼핑혜택", "쇼핑혜택_탭", "탭_"+tabName);		
	});
	$(document).on("click", ".main-content .customer-benefit .tab-content.is-active .swiper-slide", function(){
		let tabName = $(this).parents(".area-tab").find(".wrap-tit ul li.is-active button").text().replace(/\s/g, "");
		let bannerName = $(this).find(".customer-benefit__tit").text().replace(/\s/g, "");
		if($(this).hasClass("product-more-link")) {
			GA_Event("click_PC_영문_메인", "쇼핑혜택", "쇼핑혜택_탭"+tabName, "배너_더보기");			
		}
		else{
			GA_Event("click_PC_영문_메인", "쇼핑혜택", "쇼핑혜택_탭"+tabName, "배너_"+bannerName);			
		}    
	});

	//H.TREND (구, THEFRONTROW)
	$(document).on("click", ".main-content .front-row .box-tit a", function(){
		GA_Event("click_PC_영문_메인", "H.TREND", "H.TREND", "더보기");		
	});
	$(document).on("click", ".main-content .front-row .swiper__front-row .swiper-slide .front-row__img a", function(){	
		let bannerName = $(this).parents(".swiper-slide").find(".front-row__info .front-row__tit").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "H.TREND", "H.TREND배너", "배너_"+bannerName);		
	});
	$(document).on("click", ".main-content .front-row .swiper__front-row .swiper-slide .front-row__wrap .product__item a", function(){
		let bannerName = $(this).parents(".swiper-slide").find(".front-row__info .front-row__tit").text().replace(/\s/g, "");
		let brandName = $(this).find(".product__brand").text().replace(/\s/g, "");
		let productName = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "H.TREND", "H.TREND배너_"+bannerName, "상품_"+brandName+productName);		
	});

	//띠배너
	$(document).on("click", ".main-content .main-banner .swiper-slide a", function(){	
		let bannerName = $(this).find(".main-banner__tit").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "띠배너", "띠배너", "배너_"+bannerName);		
	});

	//공구특가
	$(document).on("click", ".main-content .h-share .swiper__h-share .swiper-slide .product__item a", function(){	
		let brandName = $(this).find(".product__brand").text().replace(/\s/g, "");
		let productName = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "공구특가", "공구특가_상품", "상품_"+brandName+productName);		
	});

	//해시태그
	$(document).on("click", ".main-content .hash-tag ul.tab-hash-tag li", function(){
		let tabName = $(this).find("button").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "해시태그둘러보기", "해시태그둘러보기_탭", "탭_"+tabName);		
	});
	$(document).on("click", ".main-content .hash-tag .tab-content.is-active .hash-tag-inner ul.list-product li", function(){	
		let tabName = $(this).parents(".hash-tag").find("ul.tab-hash-tag li.is-active button").text().replace(/\s/g, "");
		let brandName = $(this).find(".product__brand").text().replace(/\s/g, "");
		let productName = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "해시태그둘러보기", "해시태그둘러보기_탭_"+tabName, "상품_"+brandName+productName);		
	});
	$(document).on("click", ".main-content .hash-tag .tab-content.is-active .hash-tag-banner .hash-tag__more a", function(){
		let tabName = $(this).parents(".hash-tag").find("ul.tab-hash-tag li.is-active button").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_메인", "해시태그둘러보기", "해시태그둘러보기_탭_"+tabName, "더보기");		
	});


	/** 
	 * 공통(Header/Footer)
	 */
	// 맨위로 버튼
	$(document).on("click", ".totop", function(){
		GA_Event("click_PC_영문_공통", "Floating", "Floating", "맨위로");
	});

	/* 공통 > Header */ /* (2023-07-26 리뉴얼) */ /* (2023-07-26 수정)*/
	//Header
	$(document).on("click", ".area-gnb .wrap-gnb-util ul.list-gnb-util li a", function(){    
		let buttonName = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_공통", "Header", "Header", buttonName);
	});
	$(document).on("click", ".area-gnb .wrap-gnb-logo .btn_gnb", function(){        
		GA_Event("click_PC_영문_공통", "Header", "Header", "햄버거");
	});
	$(document).on("click", ".area-gnb .wrap-gnb-logo h1", function(){        
		GA_Event("click_PC_영문_공통", "Header", "Header", "홈버튼");
	});
	$(document).on("click", ".area-gnb .wrap-gnb-logo .wrap-gnb-search button", function(){    
		let buttonName = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_공통", "Header", "Header", buttonName);
	});
	$(document).on("click", ".area-gnb .wrap-gnb-logo .default_menu > ul > li > a", function(){
		let buttonCheck = $(this).parent();
		if(!buttonCheck.hasClass("hidden_menu")){
			let buttonName = $(this).find("strong").text().replace(/\s/g, "");
			GA_Event("click_PC_영문_공통", "Header", "Header", buttonName);
		}
	});
	$(document).on("click", ".area-gnb .wrap-gnb-util .box-gnb-util ul.list-language li a", function(){
		let languageName = $(this);
		if(languageName.hasClass("ko")){
			GA_Event("click_PC_영문_공통", "Header", "Header_언어", "언어_한국어");
		}
		else if(languageName.hasClass("cn")){
			GA_Event("click_PC_영문_공통", "Header", "Header_언어", "언어_중국어");
		}
		else if(languageName.hasClass("en")){
			GA_Event("click_PC_영문_공통", "Header", "Header_언어", "언어_영어");
		}
	});

	//퀵메뉴
	$(document).on("click", ".area-gnb .wrap-gnb-logo .default_menu .swiper-slide a", function(){
		let buttonName = $(this).find("p").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_공통", "퀵메뉴", "퀵메뉴_더보기", buttonName);
	});

	//혜택더보기 버튼 위치 변경 2023 개선 : 20231212
	$(document).on("click", ".float-benefit .float-hidden-menu .item a", function(){
		let buttonName = $(this).find("p").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_공통", "퀵메뉴", "퀵메뉴_더보기", buttonName);
	});

	//햄버거메뉴
	$(document).on("click", ".navication .gnb-category__content ul.gnb-category--list > li > a", function(){
		let categoryName = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_공통", "햄버거_메뉴", "햄버거_메뉴_카테고리", "카테고리_"+categoryName);
	});
	$(document).on("click", ".navication .gnb-category__content ul.gnb-category--2depth > li > a", function(){
		let categoryName1st = $(this).parents(".gnb-category__inner").find("ul.gnb-category--list > li.is-active > a > span").text().replace(/\s/g, "");
		let categoryName2nd = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_공통", "햄버거_메뉴", "카테고리_"+categoryName1st, "카테고리_"+categoryName2nd);
	});
	$(document).on("click", ".navication .gnb-category__content ul.gnb-category--3depth > li > a", function(){
		let categoryName2nd = $(this).parents(".gnb-category__inner").find("ul.gnb-category--2depth.is-active > li.is-active > a > span").text().replace(/\s/g, "");
		let categoryName3rd = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_공통", "햄버거_메뉴", "카테고리_"+categoryName2nd, categoryName2nd+"_"+categoryName3rd); //2023-07-26 수정
	});
	$(document).on("click", ".navication .wrap-gnb-service .gnb-service ul.list-quick-link li a", function(){
		let buttonName = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_공통", "햄버거_메뉴", "햄버거_메뉴_전체서비스", buttonName);
	});
	$(document).on("click", ".navication .gnb-showroom .swiper-slide", function(){
		let eventName1st = $(this).find(".product__brand").text().replace(/\s/g, "");
		let eventName2nd = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_공통", "햄버거_메뉴", "햄버거_메뉴_쇼룸", "이벤트_"+eventName1st+eventName2nd);
	});

	
	/* 공통 > Footer */
	// 홈버튼, SNS
	$(document).on("click", ".copyright .logo span", function(){
		GA_Event("click_PC_영문_공통", "Footer", "Footer", "홈버튼");
	});
	$(document).on("click", "#footer .sns_link a", function(){
		if ($(this).hasClass("facebook") == true){
			GA_Event("click_PC_영문_공통", "Footer", "Footer_SNS", "Facebook");
		} else if ($(this).hasClass("instagram") == true){ 
			GA_Event("click_PC_영문_공통", "Footer", "Footer_SNS", "Instagram");
		} 
	});
	
	// FNB
	$(document).on("click", "#footer .policy_menu a", function(){
		var menuNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_공통", "Footer", "Footer_안내메뉴", menuNm);
	});
	
	// 패밀리사이트
	$(document).on("click", "#footer .family_site .list a", function(){
		var siteNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_공통", "Footer", "Footer_Familysite", siteNm);
	});


	/** 
	 * 마이현대 (2023-09-13 리뉴얼)
	 */
	// 마이현대 메뉴
	$(document).on("click", ".wrap-mypage .wrap-my-hddfs .my-grade .my-grade__name .btn-my-edit", function(){
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_메뉴", "기본정보관리");
	});
	$(document).on("click", ".wrap-mypage .wrap-my-hddfs .my-grade .my-grade__info a", function(){
		var levelNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_메뉴", "멤버십등급_"+levelNm);
	});
	$(document).on("click", ".wrap-mypage .wrap-my-hddfs .my-present > div .my-present__cont a", function(){
		if($(this).parents("div").hasClass("my-present__reserve") == true){
			GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_메뉴", "적립금");
		} else if($(this).parents("div").hasClass("my-present__coupon") == true){
			GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_메뉴", "쿠폰");
		} else if($(this).parents("div").hasClass("my-present__h-point") == true){
			if ($(this).attr("id").indexOf("btnUmbJoin") > -1){
				GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_메뉴", "통합회원전환");
			} else {
				GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_메뉴", "H.point");
			}
		} else if($(this).parents("div").hasClass("my-present__card") == true){
			if ($(this).find("#my_offSptmCardAmt")){
				GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_메뉴", "오프라인선불카드");
			} else {
				GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_메뉴", " 여권정보등록");
			}
			
		}
	});
	$(document).on("click", ".wrap-mypage .wrap-my-hddfs .my-passport .my-passport__detail a.btn-edit", function(){
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_메뉴", "여권정보관리");
	});
	$(document).on("click", ".wrap-mypage .wrap-my-hddfs .my-departure .my-departure__route .my-departure__wrap a.btn-edit", function(){
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_메뉴", "출국정보관리");
	});
	$(document).on("click", ".wrap-mypage .wrap-my-hddfs .my-departure .my-departure__booking a", function(){
		if($(this).attr("href").indexOf("inptMbshPwd.do") > -1){
			GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_메뉴", "여권정보등록");
		} else if ($(this).attr("href").indexOf("listMbshDpatInfo.do") > -1){
			GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_메뉴", "출국정보등록");
		}
	});

	// 마이현대 탭
	$(document).on("click", ".wrap-mypage .wrap-my-menu .list-my-menu > li > a", function(){
		var tabNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_탭", tabNm);
	});
	$(document).on("click", ".wrap-mypage .wrap-my-menu .list-my-menu .list-my-snb > li a", function(){
		var tabNm1 = $(this).parents(".list-my-snb").siblings("a").text().replace(/\s/g, ""),
			tabNm2 = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_탭_"+tabNm1 , "탭_"+tabNm2);
	});

	// 마이현대 - 주문 있을 시
	$(document).on("click", ".wrap-mypage .wrap-my-content .list-order__head .list-order__link a", function(){
		var tabNm1 = $(this).parents(".list-order__head").find(".list-order__tit"),
			tabNm2 = tabNm1.contents().not($(tabNm1).children()).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_"+tabNm2 , "더보기");
	});
	$(document).on("click", ".wrap-mypage .list-order__content[id='orderListDiv2'] .list-product__cart .product__item .wrap-product__info .product__link", function(){
		var prodNm = $(this).parents(".wrap-product__info").find(".order-product__detail span").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_주문현황" , prodNm);
	});
	$(document).on("click", ".wrap-mypage .list-order__content[id='orderListDiv2'] .list-product__cart .product__item .wrap-product__info .order-product__link button", function(){
		var prodNm = $(this).parents(".wrap-product__info").find(".order-product__detail").text().replace(/\s/g, "");
		var btnNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_주문현황_"+prodNm , btnNm); // 교환권보기, 픽업장소보기
	});
	$(document).on("click", ".wrap-mypage .list-order__content[id='orderListDiv2'] .list-product__cart .product__item .order-product__order-num a", function(){
		var prodNm = $(this).parents(".product__item").find(".wrap-product__info .order-product__detail").text().replace(/\s/g, "");
		var orderNum = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_주문현황_"+prodNm , orderNum);
	});
	$(document).on("click", ".wrap-mypage .list-order__content[id='grvwsListDiv'] .list-product__cart .product__item .wrap-product__info .product__link", function(){
		var prodNm = $(this).parents(".wrap-product__info").find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_작성가능한상품평" , prodNm);
	});
	$(document).on("click", ".wrap-mypage .list-order__content[id='grvwsListDiv'] .list-product__cart .product__item .wrap-product__info .order-product__link button", function(){
		var prodNm = $(this).parents(".wrap-product__info").find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_작성가능한상품평_"+prodNm , "상품평작성");
	});
	$(document).on("click", ".wrap-mypage .list-order__group .list-order__wrap .list-product[id='cnrGoosListDiv'] .product__item a", function(){
		var prodNm1 = $(this).find(".product__brand").text().replace(/\s/g, ""),
			prodNm2 = $(this).find(".product__brand-info").text().replace(/\s/g, "")
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_관심상품" , prodNm1+"_"+prodNm2);
	});
	$(document).on("click", ".wrap-mypage .list-order__group .list-order__wrap .list-interest-brand[id='cnrBranListDiv'] li a", function(){
		var branNm = $(this).find(".list-interest-brand__txt").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_관심브랜드" , branNm);
	});

	// 마이현대 - 주문 없을 시
	$(document).on("click", ".wrap-mypage .list-order__content .list-order__wrap .list-product[id='noOrderListSwipe'] .product__item a", function(){
		var prodNm1 = $(this).find(".product__brand").text().replace(/\s/g, ""),
			prodNm2 = $(this).find(".product__brand-info").text().replace(/\s/g, "")
		GA_Event("click_PC_영문_마이현대", "마이현대", "마이현대_상품추천" , prodNm1+"_"+prodNm2);
	});

	/** 
	 *  마이현대 > 주문내역 (2023-10-17 리뉴얼)
	 */
	$(document).on("click", ".wrap-mypage .wrap-my-content.wrap-list-order .order-history__tab > li", function(){
		if ($(this).attr("id") == "onlnOrder"){
			GA_Event("click_PC_영문_마이현대_주문내역", "주문내역", "주문내역_탭" , "탭_인터넷면세점");
		} else if ($(this).attr("id") == "oflnOrder"){
			GA_Event("click_PC_영문_마이현대_주문내역", "주문내역", "주문내역_탭" , "탭_오프라인지점");
		}
	});
	$(document).on("click", ".wrap-mypage .wrap-my-content.wrap-list-order .list-order__head > .wrap-form__radio label input", function(){
		var btnNm = $(this).siblings(".txt-label").text().replace(/\s/g, "");
		if ($(".order-history__tab > li.is-active").attr("id") == "onlnOrder"){
			GA_Event("click_PC_영문_마이현대_주문내역", "주문내역_탭_온라인주문내역", "주문내역_탭_온라인주문내역_기준" , "기준_"+btnNm);
		} else if ($(".order-history__tab > li.is-active").attr("id") == "oflnOrder"){
			GA_Event("click_PC_영문_마이현대_주문내역", "주문내역_탭_오프라인주문내역", "주문내역_탭_오프라인주문내역_기준" , "기준_"+btnNm);
		}
	});
	$(document).on("click", ".wrap-mypage .wrap-my-content.wrap-list-order .list-order__head .wrap-form__calendar .wrap-btn label input", function(){
		var btnNm = $(this).siblings(".txt-label").text().replace(/\s/g, "");
		if ($(".order-history__tab > li.is-active").attr("id") == "onlnOrder"){
			GA_Event("click_PC_영문_마이현대_주문내역", "주문내역_탭_온라인주문내역", "주문내역_탭_온라인주문내역_날짜" , "날짜_"+btnNm);
		} else if ($(".order-history__tab > li.is-active").attr("id") == "oflnOrder"){
			GA_Event("click_PC_영문_마이현대_주문내역", "주문내역_탭_오프라인주문내역", "주문내역_탭_오프라인주문내역_날짜" , "날짜_"+btnNm);
		}
	});
	$(document).on("click", ".list-dropdown[data-parentid='orderStatSelect'] li button", function(){
		var val = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대_주문내역", "주문내역_탭_온라인주문내역", "주문내역_탭_온라인주문내역_정렬기준", "정렬기준_"+val);
	});
	$(document).on("click", ".list-dropdown[data-parentid='strcdSelect'] li button", function(){
		var val = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대_주문내역", "주문내역_탭_오프라인주문내역", "주문내역_탭_오프라인주문내역_정렬기준", "정렬기준_"+val);
	});
	$(document).on("click", ".wrap-mypage .wrap-my-content.wrap-list-order .list-order__head .order-history__group > button.btn-square", function(){
		var stDate = $(this).parents(".order-history__group").find(".choice-date-single input.datepicker#srStDt").val().replace(/\s/g, ""),
			endDate = $(this).parents(".order-history__group").find(".choice-date-single input.datepicker#srEndDt").val().replace(/\s/g, "");
		if ($(".order-history__tab > li.is-active").attr("id") == "onlnOrder"){
			GA_Event("click_PC_영문_마이현대_주문내역", "주문내역_탭_온라인주문내역", "주문내역_탭_온라인주문내역_검색날짜", "검색날짜_"+stDate+"~"+endDate);
		} else if ($(".order-history__tab > li.is-active").attr("id") == "oflnOrder"){
			GA_Event("click_PC_영문_마이현대_주문내역", "주문내역_탭_오프라인주문내역", "주문내역_탭_오프라인주문내역_검색날짜", "검색날짜_"+stDate+"~"+endDate);
		}
	});
	$(document).on("click", ".wrap-mypage .wrap-my-content.wrap-list-order .list-order__content .list-product__cart .product__item .order-product__order-num a", function(){
		var prodNum = $(this).text().replace(/\s/g, "");
		if ($(".order-history__tab > li.is-active").attr("id") == "onlnOrder"){
			GA_Event("click_PC_영문_마이현대_주문내역", "주문내역_탭_온라인주문내역", "주문내역_탭_온라인주문내역_주문상세" , "주문상세_"+prodNum);
		} else if ($(".order-history__tab > li.is-active").attr("id") == "oflnOrder"){
			GA_Event("click_PC_영문_마이현대_주문내역", "주문내역_탭_오프라인주문내역", "주문내역_탭_오프라인주문내역_주문상세" , "주문상세_"+prodNum);
		}
	});
	$(document).on("click", ".wrap-mypage .wrap-my-content.wrap-list-order .list-order__content .list-product__cart .product__item .wrap-product__info .product__link", function(){
		var prodNum = $(this).parents(".product__item").find(".order-product__order-num a").text().replace(/\s/g, "");
		if ($(".order-history__tab > li.is-active").attr("id") == "onlnOrder"){
			GA_Event("click_PC_영문_마이현대_주문내역", "주문내역_탭_온라인주문내역", "주문내역_탭_온라인주문내역_주문상세" , "주문상세_"+prodNum);
		} else if ($(".order-history__tab > li.is-active").attr("id") == "oflnOrder"){
			GA_Event("click_PC_영문_마이현대_주문내역", "주문내역_탭_오프라인주문내역", "주문내역_탭_오프라인주문내역_주문상세" , "주문상세_"+prodNum);
		}
	});


	/** 
	 * 마이현대 > 스페셜오더/공구특가
	 */
	// 탭 depth01
	$(document).on("click", ".tab-style ul[class^='tab_1depth'] li a", function(){
		if ($(this).parent().attr("id") == "spord"){
			GA_Event("click_PC_영문_마이현대_스페셜오더공구특가", "스페셜오더공구특가", "스페셜오더공구특가_탭", "탭_스페셜오더");
		} else if ($(this).parent().attr("id") == "hshare"){
			GA_Event("click_PC_영문_마이현대_스페셜오더공구특가", "스페셜오더공구특가", "스페셜오더공구특가_탭", "탭_공구특가");
		}
	});
	
	// 신청내역, 신청상태 버튼
	$(document).on("click", ".tb_list .detail_open_box td a", function(){
		var OrderNo = $(this).text().replace(/\s/g, "");
		if ($(this).parents(".tb_list").attr("id") == "spord_Tb"){
			GA_Event("click_PC_영문_마이현대_스페셜오더공구특가", "스페셜오더공구특가", "스페셜오더공구특가_탭_스페셜오더_상품", "상품_"+OrderNo);
		} else if ($(this).parents(".tb_list").attr("id") == "hshare_Tb"){
			GA_Event("click_PC_영문_마이현대_스페셜오더공구특가", "스페셜오더공구특가", "스페셜오더공구특가_탭_공구특가_상품", "상품_"+OrderNo);
		}
	});
	$(document).on("click", ".tb_list .detail_open_box td button", function(){
		var btnNm = $(this).attr("onclick");
		if ($(this).parents(".tb_list").attr("id") == "spord_Tb"){
			if (btnNm.indexOf("spordCancle") > -1){
				GA_Event("click_PC_영문_마이현대_스페셜오더공구특가", "스페셜오더공구특가", "스페셜오더공구특가_탭_스페셜오더", "신청취소");
			} else if (btnNm.indexOf("spordReOrder") > -1){
				GA_Event("click_PC_영문_마이현대_스페셜오더공구특가", "스페셜오더공구특가", "스페셜오더공구특가_탭_스페셜오더", "재신청");
			} else if (btnNm.indexOf("hshareCancle") > -1){
				GA_Event("click_PC_영문_마이현대_스페셜오더공구특가", "스페셜오더공구특가", "스페셜오더공구특가_탭_스페셜오더", "취소");
			} else if (btnNm.indexOf("location.href") > -1){
				GA_Event("click_PC_영문_마이현대_스페셜오더공구특가", "스페셜오더공구특가", "스페셜오더공구특가_탭_스페셜오더", "구매하러가기");
			} else if (btnNm.indexOf("hshareReOrder") > -1){
				GA_Event("click_PC_영문_마이현대_스페셜오더공구특가", "스페셜오더공구특가", "스페셜오더공구특가_탭_스페셜오더", "재참여");
			}
		} else if ($(this).parents(".tb_list").attr("id") == "hshare_Tb"){
			if (btnNm.indexOf("spordCancle") > -1){
				GA_Event("click_PC_영문_마이현대_스페셜오더공구특가", "스페셜오더공구특가", "스페셜오더공구특가_탭_공구특가", "신청취소");
			} else if (btnNm.indexOf("spordReOrder") > -1){
				GA_Event("click_PC_영문_마이현대_스페셜오더공구특가", "스페셜오더공구특가", "스페셜오더공구특가_탭_공구특가", "재신청");
			} else if (btnNm.indexOf("hshareCancle") > -1){
				GA_Event("click_PC_영문_마이현대_스페셜오더공구특가", "스페셜오더공구특가", "스페셜오더공구특가_탭_공구특가", "취소");
			} else if (btnNm.indexOf("location.href") > -1){
				GA_Event("click_PC_영문_마이현대_스페셜오더공구특가", "스페셜오더공구특가", "스페셜오더공구특가_탭_공구특가", "구매하러가기");
			} else if (btnNm.indexOf("hshareReOrder") > -1){
				GA_Event("click_PC_영문_마이현대_스페셜오더공구특가", "스페셜오더공구특가", "스페셜오더공구특가_탭_공구특가", "재참여");
			}
		}
	});


	/** 
	 * 마이현대 > 적립금내역
	 */
	// 탭 depth01
	$(document).on("click", ".tab-style ul[class^='tab_1depth'] li a", function(){
		if ($(this).parent().attr("id") == "normal"){
			GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역", "적립금내역_탭", "탭_일반");
		} else if ($(this).parent().attr("id") == "event"){
			GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역", "적립금내역_탭", "탭_추가적립금");
		} else if ($(this).parent().attr("id") == "bran"){
			GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역", "적립금내역_탭", "탭_브랜드적립금");
		} else if ($(this).parent().attr("id") == "ptns"){
			GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역", "적립금내역_탭", "탭_제휴플러스");
		} else if ($(this).parent().attr("id") == "payment"){
			GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역", "적립금내역_탭", "탭_결제플러스");
		}
	});
	
	// 탭 필터 - 날짜
	$(document).on("click", ".myhd_content .period .textbox.monthbox li a", function(){
		if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "normal"){
			if ($(this).attr("onclick") == "fnDateSetting(this,'1');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_일반", "적립금내역_탭_일반_날짜", "날짜_1개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'3');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_일반", "적립금내역_탭_일반_날짜", "날짜_3개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'6');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_일반", "적립금내역_탭_일반_날짜", "날짜_6개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,12);"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_일반", "적립금내역_탭_일반_날짜", "날짜_12개월");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "event"){
			if ($(this).attr("onclick") == "fnDateSetting(this,'1');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_추가적립금", "적립금내역_탭_추가적립금_날짜", "날짜_1개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'3');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_추가적립금", "적립금내역_탭_추가적립금_날짜", "날짜_3개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'6');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_추가적립금", "적립금내역_탭_추가적립금_날짜", "날짜_6개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,12);"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_추가적립금", "적립금내역_탭_추가적립금_날짜", "날짜_12개월");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "bran"){
			if ($(this).attr("onclick") == "fnDateSetting(this,'1');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_브랜드적립금", "적립금내역_탭_브랜드적립금_날짜", "날짜_1개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'3');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_브랜드적립금", "적립금내역_탭_브랜드적립금_날짜", "날짜_3개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'6');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_브랜드적립금", "적립금내역_탭_브랜드적립금_날짜", "날짜_6개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,12);"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_브랜드적립금", "적립금내역_탭_브랜드적립금_날짜", "날짜_12개월");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "ptns"){
			if ($(this).attr("onclick") == "fnDateSetting(this,'1');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_제휴플러스", "적립금내역_탭_제휴플러스_날짜", "날짜_1개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'3');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_제휴플러스", "적립금내역_탭_제휴플러스_날짜", "날짜_3개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'6');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_제휴플러스", "적립금내역_탭_제휴플러스_날짜", "날짜_6개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,12);"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_제휴플러스", "적립금내역_탭_제휴플러스_날짜", "날짜_12개월");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "payment"){
			if ($(this).attr("onclick") == "fnDateSetting(this,'1');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_결제플러스", "적립금내역_탭_결제플러스_날짜", "날짜_1개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'3');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_결제플러스", "적립금내역_탭_결제플러스_날짜", "날짜_3개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'6');"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_결제플러스", "적립금내역_탭_결제플러스_날짜", "날짜_6개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,12);"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_결제플러스", "적립금내역_탭_결제플러스_날짜", "날짜_12개월");
			}
		}
	});	

	// 탭 필터 - 검색날짜
	$(document).on("click", ".myhd_content .period .dcheck_btn", function(){
		var stDt = $(this).parents(".period").find(".datepicker_box input.datepicker#stDt").val().replace(/\s/g, ""),
			endDt = $(this).parents(".period").find(".datepicker_box input.datepicker#endDt").val().replace(/\s/g, "");
		if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "normal"){
			GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_일반", "적립금내역_탭_일반_검색날짜", "검색날짜_"+stDt+"~"+endDt);
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "event"){
			GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_추가적립금", "적립금내역_탭_추가적립금_검색날짜", "검색날짜_"+stDt+"~"+endDt);
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "bran"){
			GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_브랜드적립금", "적립금내역_탭_브랜드적립금_검색날짜", "검색날짜_"+stDt+"~"+endDt);
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "ptns"){
			GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_제휴플러스", "적립금내역_탭_제휴플러스_검색날짜", "검색날짜_"+stDt+"~"+endDt);
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "payment"){
			GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_결제플러스", "적립금내역_탭_결제플러스_검색날짜", "검색날짜_"+stDt+"~"+endDt);
		}
	});

	// 탭 정렬 - 채널구분
	$(document).on("change", ".myhd_content .sorting_wrap.myhd select[name='siteChlCd']", function(){
		var val = $(this).val();
		if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "normal"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_일반", "적립금내역_탭_일반_정렬기준", "정렬기준_채널구분");
			} else if (val == "ALL"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_일반", "적립금내역_탭_일반_정렬기준", "정렬기준_채널구분_전체");
			} else if (val == "PC"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_일반", "적립금내역_탭_일반_정렬기준", "정렬기준_채널구분_PC");
			} else if (val == "MO"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_일반", "적립금내역_탭_일반_정렬기준", "정렬기준_채널구분_모바일웹");
			} else if (val == "AP"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_일반", "적립금내역_탭_일반_정렬기준", "정렬기준_채널구분_APP");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "event"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_추가적립금", "적립금내역_탭_추가적립금_정렬기준", "정렬기준_채널구분");
			} else if (val == "ALL"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_추가적립금", "적립금내역_탭_추가적립금_정렬기준", "정렬기준_채널구분_전체");
			} else if (val == "PC"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_추가적립금", "적립금내역_탭_추가적립금_정렬기준", "정렬기준_채널구분_PC");
			} else if (val == "MO"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_추가적립금", "적립금내역_탭_추가적립금_정렬기준", "정렬기준_채널구분_모바일웹");
			} else if (val == "AP"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_추가적립금", "적립금내역_탭_추가적립금_정렬기준", "정렬기준_채널구분_APP");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "bran"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_브랜드적립금", "적립금내역_탭_브랜드적립금_정렬기준", "정렬기준_채널구분");
			} else if (val == "ALL"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_브랜드적립금", "적립금내역_탭_브랜드적립금_정렬기준", "정렬기준_채널구분_전체");
			} else if (val == "PC"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_브랜드적립금", "적립금내역_탭_브랜드적립금_정렬기준", "정렬기준_채널구분_PC");
			} else if (val == "MO"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_브랜드적립금", "적립금내역_탭_브랜드적립금_정렬기준", "정렬기준_채널구분_모바일웹");
			} else if (val == "AP"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_브랜드적립금", "적립금내역_탭_브랜드적립금_정렬기준", "정렬기준_채널구분_APP");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "ptns"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_제휴플러스", "적립금내역_탭_제휴플러스_정렬기준", "정렬기준_채널구분");
			} else if (val == "ALL"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_제휴플러스", "적립금내역_탭_제휴플러스_정렬기준", "정렬기준_채널구분_전체");
			} else if (val == "PC"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_제휴플러스", "적립금내역_탭_제휴플러스_정렬기준", "정렬기준_채널구분_PC");
			} else if (val == "MO"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_제휴플러스", "적립금내역_탭_제휴플러스_정렬기준", "정렬기준_채널구분_모바일웹");
			} else if (val == "AP"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_제휴플러스", "적립금내역_탭_제휴플러스_정렬기준", "정렬기준_채널구분_APP");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "payment"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_결제플러스", "적립금내역_탭_결제플러스_정렬기준", "정렬기준_채널구분");
			} else if (val == "ALL"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_결제플러스", "적립금내역_탭_결제플러스_정렬기준", "정렬기준_채널구분_전체");
			} else if (val == "PC"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_결제플러스", "적립금내역_탭_결제플러스_정렬기준", "정렬기준_채널구분_PC");
			} else if (val == "MO"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_결제플러스", "적립금내역_탭_결제플러스_정렬기준", "정렬기준_채널구분_모바일웹");
			} else if (val == "AP"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_결제플러스", "적립금내역_탭_결제플러스_정렬기준", "정렬기준_채널구분_APP");
			}
		}
	});

	// 탭 정렬 - 사용구분
	$(document).on("change", ".myhd_content .sorting_wrap.myhd select[name='svmtUseCd']", function(){
		var val = $(this).val();
		if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "normal"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_일반", "적립금내역_탭_일반_정렬기준", "정렬기준_사용구분");
			} else if (val == "ALL"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_일반", "적립금내역_탭_일반_정렬기준", "정렬기준_사용구분_전체");
			} else if (val == "002"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_일반", "적립금내역_탭_일반_정렬기준", "정렬기준_사용구분_적립");
			} else if (val == "001"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_일반", "적립금내역_탭_일반_정렬기준", "정렬기준_사용구분_사용");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "event"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_추가적립금", "적립금내역_탭_추가적립금_정렬기준", "정렬기준_사용구분");
			} else if (val == "ALL"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_추가적립금", "적립금내역_탭_추가적립금_정렬기준", "정렬기준_사용구분_전체");
			} else if (val == "002"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_추가적립금", "적립금내역_탭_추가적립금_정렬기준", "정렬기준_사용구분_적립");
			} else if (val == "001"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_추가적립금", "적립금내역_탭_추가적립금_정렬기준", "정렬기준_사용구분_사용");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "bran"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_브랜드적립금", "적립금내역_탭_브랜드적립금_정렬기준", "정렬기준_사용구분");
			} else if (val == "ALL"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_브랜드적립금", "적립금내역_탭_브랜드적립금_정렬기준", "정렬기준_사용구분_전체");
			} else if (val == "002"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_브랜드적립금", "적립금내역_탭_브랜드적립금_정렬기준", "정렬기준_사용구분_적립");
			} else if (val == "001"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_브랜드적립금", "적립금내역_탭_브랜드적립금_정렬기준", "정렬기준_사용구분_사용");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "ptns"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_제휴플러스", "적립금내역_탭_제휴플러스_정렬기준", "정렬기준_사용구분");
			} else if (val == "ALL"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_제휴플러스", "적립금내역_탭_제휴플러스_정렬기준", "정렬기준_사용구분_전체");
			} else if (val == "002"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_제휴플러스", "적립금내역_탭_제휴플러스_정렬기준", "정렬기준_사용구분_적립");
			} else if (val == "001"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_제휴플러스", "적립금내역_탭_제휴플러스_정렬기준", "정렬기준_사용구분_사용");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "payment"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_결제플러스", "적립금내역_탭_결제플러스_정렬기준", "정렬기준_사용구분");
			} else if (val == "ALL"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_결제플러스", "적립금내역_탭_결제플러스_정렬기준", "정렬기준_사용구분_전체");
			} else if (val == "002"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_결제플러스", "적립금내역_탭_결제플러스_정렬기준", "정렬기준_사용구분_적립");
			} else if (val == "001"){
				GA_Event("click_PC_영문_마이현대_적립금내역", "적립금내역_탭_결제플러스", "적립금내역_탭_결제플러스_정렬기준", "정렬기준_사용구분_사용");
			}
		}
	});


	/** 
	 * 마이현대 > 쿠폰내역
	 */
	// 탭 depth01
	$(document).on("click", ".tab-style ul[class^='tab_1depth'] li a", function(){
		if ($(this).parent().attr("id") == "listCup"){
			GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역", "쿠폰내역_탭", "탭_쿠폰내역");
		} else if ($(this).parent().attr("id") == "dnldCup"){
			GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역", "쿠폰내역_탭", "탭_다운로드가능쿠폰");
		}
	});

	// 탭 필터 - 날짜
	$(document).on("click", ".myhd_content .period .textbox.monthbox li a", function(){
		if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "listCup"){
			if ($(this).attr("onclick") == "fnDateSetting(this,'1');"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_날짜", "날짜_1개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'3');"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_날짜", "날짜_3개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'6');"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_날짜", "날짜_6개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,12);"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_날짜", "날짜_12개월");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "dnldCup"){
			if ($(this).attr("onclick") == "fnDateSetting(this,'1');"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_날짜", "날짜_1개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'3');"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_날짜", "날짜_3개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'6');"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_날짜", "날짜_6개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,12);"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_날짜", "날짜_12개월");
			}
		}
	});	

	// 탭 필터 - 검색날짜
	$(document).on("click", ".myhd_content .period .dcheck_btn", function(){
		var stDt = $(this).parents(".period").find(".datepicker_box input.datepicker#stDt").val().replace(/\s/g, ""),
			endDt = $(this).parents(".period").find(".datepicker_box input.datepicker#endDt").val().replace(/\s/g, "");
		if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "listCup"){
			GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_검색날짜", "검색날짜_"+stDt+"~"+endDt);
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "dnldCup"){
			GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_검색날짜", "검색날짜_"+stDt+"~"+endDt);
		}
	});

	// 탭 정렬 - 채널구분
	$(document).on("change", ".myhd_content .sorting_wrap.myhd select[name='siteChlCd']", function(){
		var val = $(this).val();
		if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "listCup"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_정렬기준", "정렬기준_채널구분");
			} else if (val == "ALL"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_정렬기준", "정렬기준_채널구분_전체");
			} else if (val == "PC"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_정렬기준", "정렬기준_채널구분_PC");
			} else if (val == "MO"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_정렬기준", "정렬기준_채널구분_모바일웹");
			} else if (val == "AP"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_정렬기준", "정렬기준_채널구분_APP");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "dnldCup"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_정렬기준", "정렬기준_채널구분");
			} else if (val == "ALL"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_정렬기준", "정렬기준_채널구분_전체");
			} else if (val == "PC"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_정렬기준", "정렬기준_채널구분_PC");
			} else if (val == "MO"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_정렬기준", "정렬기준_채널구분_모바일웹");
			} else if (val == "AP"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_정렬기준", "정렬기준_채널구분_APP");
			}
		}
	});

	// 탭 정렬 - 사용구분
	$(document).on("change", ".myhd_content .sorting_wrap.myhd select[name='useCls']", function(){
		var val = $(this).val();
		if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "listCup"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_정렬기준", "정렬기준_사용구분");
			} else if (val == "A"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_정렬기준", "정렬기준_사용구분_전체");
			} else if (val == "N"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_정렬기준", "정렬기준_사용구분_미사용");
			} else if (val == "Y"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_정렬기준", "정렬기준_사용구분_사용");
			} else if (val == "E"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_정렬기준", "정렬기준_사용구분_기간만료");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "dnldCup"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_정렬기준", "정렬기준_사용구분");
			} else if (val == "A"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_정렬기준", "정렬기준_사용구분_전체");
			} else if (val == "N"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_정렬기준", "정렬기준_사용구분_미사용");
			} else if (val == "Y"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_정렬기준", "정렬기준_사용구분_사용");
			} else if (val == "E"){
				GA_Event("click_PC_영문_마이현대_쿠폰내역", "쿠폰내역_탭_다운로드가능쿠폰", "쿠폰내역_탭_다운로드가능쿠폰_정렬기준", "정렬기준_사용구분_기간만료");
			}
		}
	});


	/** 
	 * 마이현대 > 예치금/상품권전환금
	 */
	// 탭 depth01
	$(document).on("click", ".tab-style ul[class^='tab_1depth'] li a", function(){
		if ($(this).parent().attr("id") == "cdpst"){
			GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금", "예치금상품권전환금_탭", "탭_예치금");
		} else if ($(this).parent().attr("id") == "gfca"){
			GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금", "예치금상품권전환금_탭", "탭_상품권전환금");
		}
	});

	// 탭 필터 - 날짜
	$(document).on("click", ".myhd_content .period .textbox.monthbox li a", function(){
		if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "cdpst"){
			if ($(this).attr("onclick") == "fnDateSetting(this,'1');"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_예치금", "예치금상품권전환금_탭_예치금_날짜", "날짜_1개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'3');"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_예치금", "예치금상품권전환금_탭_예치금_날짜", "날짜_3개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'6');"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_예치금", "예치금상품권전환금_탭_예치금_날짜", "날짜_6개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,12);"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_예치금", "예치금상품권전환금_탭_예치금_날짜", "날짜_12개월");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "gfca"){
			if ($(this).attr("onclick") == "fnDateSetting(this,'1');"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_상품권전환금", "예치금상품권전환금_탭_상품권전환금_날짜", "날짜_1개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'3');"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_상품권전환금", "예치금상품권전환금_탭_상품권전환금_날짜", "날짜_3개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,'6');"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_상품권전환금", "예치금상품권전환금_탭_상품권전환금_날짜", "날짜_6개월");
			} else if ($(this).attr("onclick") == "fnDateSetting(this,12);"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_상품권전환금", "예치금상품권전환금_탭_상품권전환금_날짜", "날짜_12개월");
			}
		}
	});	

	// 탭 필터 - 검색날짜
	$(document).on("click", ".myhd_content .period .dcheck_btn", function(){
		var stDt = $(this).parents(".period").find(".datepicker_box input.datepicker#stDt").val().replace(/\s/g, ""),
			endDt = $(this).parents(".period").find(".datepicker_box input.datepicker#endDt").val().replace(/\s/g, "");
		if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "cdpst"){
			GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_예치금", "예치금상품권전환금_탭_예치금_검색날짜", "검색날짜_"+stDt+"~"+endDt);
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "gfca"){
			GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_상품권전환금", "예치금상품권전환금_탭_상품권전환금_검색날짜", "검색날짜_"+stDt+"~"+endDt);
		}
	});

	// 탭 정렬 - 사용구분
	$(document).on("change", ".myhd_content .sorting_wrap.myhd select[name='useStat']", function(){
		var val = $(this).val();
		if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "cdpst"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_예치금", "예치금상품권전환금_탭_예치금_정렬기준", "정렬기준_사용구분");
			} else if (val == "ALL"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_예치금", "예치금상품권전환금_탭_예치금_정렬기준", "정렬기준_사용구분_전체");
			} else if (val == "SAVE"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_예치금", "예치금상품권전환금_탭_예치금_정렬기준", "정렬기준_사용구분_적립");
			} else if (val == "USE"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_예치금", "예치금상품권전환금_탭_예치금_정렬기준", "정렬기준_사용구분_사용");
			} else if (val == "WITHDRAW"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_예치금", "예치금상품권전환금_탭_예치금_정렬기준", "정렬기준_사용구분_출금");
			}
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("id") == "gfca"){
			if (val == ""){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_상품권전환금", "예치금상품권전환금_탭_상품권전환금_정렬기준", "정렬기준_사용구분");
			} else if (val == "ALL"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_상품권전환금", "예치금상품권전환금_탭_상품권전환금_정렬기준", "정렬기준_사용구분_전체");
			} else if (val == "SAVE"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_상품권전환금", "예치금상품권전환금_탭_상품권전환금_정렬기준", "정렬기준_사용구분_적립");
			} else if (val == "USE"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_상품권전환금", "예치금상품권전환금_탭_상품권전환금_정렬기준", "정렬기준_사용구분_사용");
			} else if (val == "WITHDRAW"){
				GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_상품권전환금", "예치금상품권전환금_탭_상품권전환금_정렬기준", "정렬기준_사용구분_출금");
			}
		}
	});

	// 예치금 출금신청 버튼
	$(document).on("click", ".myhd_content .myhd_dashbord.in_dashbord .button button", function(){
		GA_Event("click_PC_영문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_예치금", "예치금상품권전환금_탭_예치금", "출금신청");
	});


	/** 
	 * 마이현대 > 관심상품/브랜드
	 */
	// 탭 depth01
	$(document).on("click", ".tab-style ul[class^='tab_1depth'] li a", function(){
		if ($(this).parent().attr("onclick") == "goCnrlist('listCnrGoos');"){
			GA_Event("click_PC_영문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭", "탭_관심상품");
		} else if ($(this).parent().attr("onclick") == "goCnrlist('listCnrBran');"){
			GA_Event("click_PC_영문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭", "탭_관심브랜드");
		}
	});
	
	// 관심상품/브랜드 리스트
	$(document).on("click", ".myhd_content .product_list li a", function(){
		var prodNm = $(this).find(".tx_ex").text(),
			branNm = $(this).find("p.brname").text().replace(/\s/g, "");
		if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("onclick") == "goCnrlist('listCnrGoos');"){
			GA_Event("click_PC_영문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭_관심상품", "상품_"+prodNm);
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("onclick") == "goCnrlist('listCnrBran');"){
			GA_Event("click_PC_영문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭_관심브랜드", "브랜드_"+branNm);
		}
	});
	// 관심상품 버튼(장바구니, 바로구매, 재입고일림)(/js/KO/common.js)

	// 관심취소 버튼
	$(document).on("click", ".myhd_content .product_list li .img_w em.btn_like", function(){
		if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("onclick") == "goCnrlist('listCnrGoos');"){
			GA_Event("click_PC_영문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭_관심상품", "관심취소");
		} else if ($("ul[class^='tab_1depth'] li.ui-tabs-active").attr("onclick") == "goCnrlist('listCnrBran');"){
			GA_Event("click_PC_영문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭_관심브랜드", "관심취소");
		}
	});


	/** 
	 * 마이현대 > 상품평
	 */
	// 탭 depth01
	$(document).on("click", ".myhd_asis .tab_type01 li a", function(){
		if ($(this).attr("title") == "comment01"){
			GA_Event("click_PC_영문_마이현대_상품평", "상품평", "상품평_탭", "탭_작성완료상품");
		} else if ($(this).attr("title") == "comment02"){
			GA_Event("click_PC_영문_마이현대_상품평", "상품평", "상품평_탭", "탭_미작성상품");
		} 
	});
	
	// 작성완료상품 버튼
	$(document).on("click", "#wrtGrvwsList .review_type .grade_wrap .btn_box button", function(){
		var btnNm = $(this).attr("onclick");
		if (btnNm.indexOf("delGrvws") > -1){
			GA_Event("click_PC_영문_마이현대_상품평", "상품평", "상품평_탭_작성완료상품", "삭제");
		} else if (btnNm.indexOf("openEdtGoosGrvwsFormPop") > -1){
			GA_Event("click_PC_영문_마이현대_상품평", "상품평", "상품평_탭_작성완료상품", "수정");
		}
	});
	
	// 미작성상품 버튼
	$(document).on("click", "#notWrtGrvwsList td button", function(){
		GA_Event("click_PC_영문_마이현대_상품평", "상품평", "상품평_탭_미작성상품", "작성");
	});


	/** 
	 * 마이현대 > 기본정보관리
	 */
	// 마케팅정보수신동의여부 버튼
	$(document).on("click", "#frmDetailBaseInfoMnge .tb_write01 input[type='checkbox'] + label", function(){
		if ($(this).prev("input").is(":checked")){
			if ($(this).prev("input").attr("id") == "agrYn"){
				GA_Event("click_PC_영문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_마케팅정보수신동의", "마케팅정보수신동의취소_마케팅정보수신동의");
			} else if ($(this).prev("input").attr("id") == "smsRcvYn"){
				GA_Event("click_PC_영문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_마케팅정보수신동의", "마케팅정보수신동의취소_SMS");
			} else if ($(this).prev("input").attr("id") == "mailRcvYn"){
				GA_Event("click_PC_영문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_마케팅정보수신동의", "마케팅정보수신동의취소_이메일");
			}
		} else {
			if ($(this).prev("input").attr("id") == "agrYn"){
				GA_Event("click_PC_영문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_마케팅정보수신동의", "마케팅정보수신동의_마케팅정보수신동의");
			} else if ($(this).prev("input").attr("id") == "smsRcvYn"){
				GA_Event("click_PC_영문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_마케팅정보수신동의", "마케팅정보수신동의_SMS");
			} else if ($(this).prev("input").attr("id") == "mailRcvYn"){
				GA_Event("click_PC_영문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_마케팅정보수신동의", "마케팅정보수신동의_이메일");
			}
		}
	});
	
	// 개인정보유효기간 버튼
	$(document).on("click", "#frmDetailBaseInfoMnge .tb_write01 .expiration_day input[type='radio'] + label", function(){
		if ($(this).prev("input").attr("id") == "expiration_day01"){
			GA_Event("click_PC_영문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_개인정보유효기간", "개인정보유효기간_1년");
		} else if ($(this).prev("input").attr("id") == "expiration_day02"){
			GA_Event("click_PC_영문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_개인정보유효기간", "개인정보유효기간_3년");
		} else if ($(this).prev("input").attr("id") == "expiration_day04"){
			GA_Event("click_PC_영문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_개인정보유효기간", "개인정보유효기간_탈퇴시파기");
		} 
	});
	
	// 회원구분 버튼
	$(document).on("click", "#frmDetailBaseInfoMnge button#btnChgUmbMbsh", function(){
		GA_Event("click_PC_영문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_회원구분", "H.Point통합회원전환");
	});
	
	// 회원탈퇴 버튼
	$(document).on("click", "#frmDetailBaseInfoMnge button#btnMbshWithdrawal", function(){
		GA_Event("click_PC_영문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_회원탈퇴", "회원탈퇴");
	});
	$(document).on("click", "#frmMbshWithdrawal button#btnCancel", function(){
		GA_Event("click_PC_영문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_회원탈퇴", "취소");
	});
	$(document).on("click", "#frmMbshWithdrawal button#btnConfirm", function(){
		GA_Event("click_PC_영문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_회원탈퇴", "탈퇴신청");
	});
	
	// 회원탈퇴 사유
	$(document).on("click", "#widrResnCd-menu li", function(){
		var selNm = $(this).find(".ui-state-active").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_회원탈퇴사유", "회원탈퇴사유_"+selNm);
	});

	/** 
	 * 고객센터
	 */
	// LNB
	$(document).on("click", ".lnb_customer .lnb li a", function(){
		var lnbNm = $(this).parents("ul").siblings("span").text().replace(/\s/g, ""),
			lnbNm1 = $(this).text().replace(/\s/g, "");
		if ($(this).parents("ul").prev("span").length > 0){
			GA_Event("click_PC_영문_고객센터", lnbNm, lnbNm, lnbNm1);
		} else {
			GA_Event("click_PC_영문_고객센터", lnbNm1, lnbNm1, "더보기");
		}
	});

	/* S : 2024-11-11 고객센터 메인 개선 */
	// 고객센터 메인, FAQ 검색어(/om/consmComm/main.jsp)
	$(document).on("click", ".customer_top .faq_sh form[name='searchForm'] #searchBtn", function(){
		var faqSrch =  $(this).parents("form[name='searchForm']").find("input[id='faqsh']").val().replace(/\s/g, "");
		GA_Event("click_PC_영문_고객센터", "FAQ", "FAQ_검색", "검색어_"+faqSrch);
	});

	$(document).on("click", ".customer_top .faq_top10 .btn_inquiry", function(){
		GA_Event("click_PC_영문_고객센터", "FAQ", "FAQ_1:1문의", "회원문의하기");
	});

	$(document).on("click", ".customer_top .faq_top10 .faq_more", function(){
		GA_Event("click_PC_영문_고객센터", "FAQ", "FAQ", "전체보기");
	});

	$(document).on("click", ".customer_top .faq_top10 .faq_list dt a", function(){
		var faqNm = $(this).contents().not($(this).children("i")).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_고객센터", "FAQ", "FAQ_TOP10", faqNm);
	});
	
	// 공지사항, 당첨자발표 리스트
	$(document).on("click", ".customer_noti > div ul li a", function(){
		var notiNm = $(this).text().replace(/\s/g, ""),
			notiNmCut = notiNm.substring(0, 10);
		if (notiNm.length > 10){ // 글자수 제한(10자 이상 삭제)
			if ($(this).parents("div").hasClass("noti_list") == true){
				GA_Event("click_PC_영문_고객센터", "공지사항", "공지사항_상세", notiNmCut+"⋯");
			} else if ($(this).parents("div").hasClass("noti_evnt") == true){
				GA_Event("click_PC_영문_고객센터", "당첨자발표", "당첨자발표_상세", notiNmCut+"⋯");
			} 
		} else {
			if ($(this).parents("div").hasClass("noti_list") == true){
				GA_Event("click_PC_영문_고객센터", "공지사항", "공지사항_상세", notiNm);
			} else if ($(this).parents("div").hasClass("noti_evnt") == true){
				GA_Event("click_PC_영문_고객센터", "당첨자발표", "당첨자발표_상세", notiNm);
			} 
		}
	});
	
	// 공지사항, 당첨자발표 더보기
	$(document).on("click", ".customer_noti > div .noti_more", function(){
		if ($(this).parents("div").hasClass("noti_list") == true){
			GA_Event("click_PC_영문_고객센터", "공지사항", "공지사항", "더보기");
		} else if ($(this).parents("div").hasClass("noti_evnt") == true){
			GA_Event("click_PC_영문_고객센터", "당첨자발표", "당첨자발표", "더보기");
		} 
	});
	/* E : 2024-11-11 고객센터 메인 개선 */


	/** 
	 * 고객센터 > FAQ
	 */
	// FAQ 탭
	$(document).on("click", ".faq_tab ul li a", function(){
		if ($(this).parent().index() == 0){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ", "FAQ_탭", "탭_FAQTOP10");
		} else if ($(this).parent().index() == 1){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ", "FAQ_탭", "탭_전체");
		} else if ($(this).parent().index() == 2){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ", "FAQ_탭", "탭_기타");
		} else if ($(this).parent().index() == 3){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ", "FAQ_탭", "탭_주문/결제");
		} else if ($(this).parent().index() == 4){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ", "FAQ_탭", "탭_교환/환불");
		} else if ($(this).parent().index() == 5){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ", "FAQ_탭", "탭_상품수령");
		} else if ($(this).parent().index() == 6){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ", "FAQ_탭", "탭_적립금/쿠폰");
		} else if ($(this).parent().index() == 7){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ", "FAQ_탭", "탭_상품/브랜드");
		} else if ($(this).parent().index() == 8){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ", "FAQ_탭", "탭_회원/멤버쉽");
		} else if ($(this).parent().index() == 9){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ", "FAQ_탭", "탭_h.point");
		}
	});
	
	// FAQ 탭 리스트
	$(document).on("click", ".faq_list .faq dt a", function(){
		var tabNm = $(".faq_tab ul li a.active").parent(),
			faqNm = $(this).contents().not($(this).children("span")).text().replace(/\s/g, "");
		if (tabNm.index() == 0){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ_탭", "FAQ_탭_FAQTOP10_질문", faqNm);
		} else if (tabNm.index() == 1){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ_탭", "FAQ_탭_전체_질문", faqNm);
		} else if (tabNm.index() == 2){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ_탭", "FAQ_탭_기타_질문", faqNm);
		} else if (tabNm.index() == 3){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ_탭", "FAQ_탭_주문/결제_질문", faqNm);
		} else if (tabNm.index() == 4){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ_탭", "FAQ_탭_교환/환불_질문", faqNm);
		} else if (tabNm.index() == 5){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ_탭", "FAQ_탭_상품수령_질문", faqNm);
		} else if (tabNm.index() == 6){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ_탭", "FAQ_탭_적립금/쿠폰_질문", faqNm);
		} else if (tabNm.index() == 7){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ_탭", "FAQ_탭_상품/브랜드_질문", faqNm);
		} else if (tabNm.index() == 8){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ_탭", "FAQ_탭_회원/멤버쉽_질문", faqNm);
		} else if (tabNm.index() == 9){ 
			GA_Event("click_PC_영문_고객센터_FAQ", "FAQ_탭", "FAQ_탭_h.point_질문", faqNm);
		}
	});


	/** 
	 * 검색
	 */
	// 검색어(/tiles/searchLayer.jsp)

	// 검색유형 선택
	$(document).on("click", "#header .searchfield .select_search button", function(){
		if ($(".select_search").hasClass("tag") == true){
			GA_Event("click_PC_영문_검색", "검색전", "검색전_검색유형선택", "해시태그검색");
		} else {
			GA_Event("click_PC_영문_검색", "검색전", "검색전_검색유형선택", "일반검색");
		}
	});

	// 검색 > 검색전
	// 검색 탭
	$(document).on("click", ".advanced_search .tab-action #searchTabBox li a", function(){
		if ($(this).parent().attr("id") == "rcntTab"){
			GA_Event("click_PC_영문_검색", "검색전", "검색전_탭", "탭_최근인기검색어");
		} else if($(this).parent().attr("id") == "brandTab"){
			GA_Event("click_PC_영문_검색", "검색전", "검색전_탭", "탭_브랜드검색");
			
			// 하위 탭 '브랜드/카테고리'도 작동하는 이슈
			// tiles/searchLayer.jsp에 트리거 되어져 있음.
			// $(".tab_round #default_brand_tab a").trigger('click');
		}
	});

	// 최근인기검색어
	$(document).on("click", ".adsearch_panel .popular_search .words_box .words_list li a", function(){
		var srchTerm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "검색전", "검색전_최근검색어", "검색어_"+srchTerm);
	});
	$(document).on("click", ".adsearch_panel .popular_search .words_box #deleteAll", function(){
		GA_Event("click_PC_영문_검색", "검색전", "검색전_최근검색어", "전체삭제");
	});
	$(document).on("click", ".adsearch_panel .popular_search .words_box .switch input[id='autoSaveBtn'] + label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_PC_영문_검색", "검색전", "검색전_최근검색어", "자동저장끄기");
		} else {
			GA_Event("click_PC_영문_검색", "검색전", "검색전_최근검색어", "자동저장켜키");
		}
	});
	$(document).on("click", ".adsearch_panel .popular_search .hashtag_area .list button", function(){
		var srchTerm = $(this).text().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/gi, "").substring(3).replace(/\s/g, "");
		if ($(this).attr("onclick").indexOf("hashSearchResult.do") > -1){
			GA_Event("click_PC_영문_검색", "검색전", "검색전_인기해시태그검색어", "검색어_"+srchTerm);
		} else if ($(this).attr("onclick").indexOf("searchResult.do") > -1){
			GA_Event("click_PC_영문_검색", "검색전", "검색전_인기검색어", "검색어_"+srchTerm);
		}
	});
	
	// 브랜드검색
	$(document).on("click", ".adsearch_panel .brand_search .tab-action .tab_round li a", function(){
		if ($(this).parent().attr("id") == "default_brand_tab"){
			GA_Event("click_PC_영문_검색", "검색전", "검색전_브랜드검색", "브랜드검색_브랜드");
		} else if($(this).parent().attr("id") == "default_category_tab"){
			GA_Event("click_PC_영문_검색", "검색전", "검색전_브랜드검색", "브랜드검색_카테고리");
		}
	});
	// $(document).on("click", ".adsearch_panel .brand_search .sort_wrap .sortbtn_wrap li a", function(){
	// 	if ($(this).attr("onclick") == "switchBranTab('01');"){
	// 		GA_Event("click_PC_영문_검색", "검색전", "검색전_브랜드검색", "정렬_가나다순");
	// 	} else if($(this).attr("onclick") == "switchBranTab('02');"){
	// 		GA_Event("click_PC_영문_검색", "검색전", "검색전_브랜드검색", "정렬_ABC순");
	// 	}
	// });
	$(document).on("click", ".adsearch_panel .brand_search .sort_wrap .lang_sort .brand_cate li button", function(){
		var sortNm = $(this).contents().not($(this).children("em")).text().replace(/\s/g, "");
		if ($(this).parents("#advanced_search_02").find("#advanced_search_brand_01").length > 0){
			GA_Event("click_PC_영문_검색", "검색전", "검색전_브랜드검색", "정렬기준_"+sortNm);
		} else if ($(this).parents("#advanced_search_02").find("#advanced_search_brand_02").length > 0){
			GA_Event("click_PC_영문_검색", "검색전", "검색전_브랜드검색", "카테고리_"+sortNm);
		} 
	});
	$(document).on("click", ".adsearch_panel .brand_search .sort_result input[type='button'] + label", function(){
		var branNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "검색전", "검색전_브랜드검색", "브랜드_"+branNm);
	});

	// 검색 > 자동완성, 키워드
	$(document).on("click", ".search_autocomplete .brand_shop a", function(){
		var srchKwd = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "검색후", "검색후_키워드", "키워드_"+srchKwd);
	});
	$(document).on("click", ".search_autocomplete .searchresults_brand li a", function(){
		var srchBran = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "자동완성", "자동완성_연관브랜드", "브랜드_"+srchBran);
	});
	$(document).on("click", ".search_autocomplete .searchresults_word li a", function(){
		var srchWord = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "자동완성", "자동완성_연관검색어", "검색어_"+srchWord);
	});
	$(document).on("click", ".search_autocomplete .searchresults_category li a", function(){
		var srchCtgy = $(this).contents().not($(this).children()).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "자동완성", "자동완성_연관카테고리", "카테고리_"+srchCtgy);
	});
	$(document).on("click", ".search_autocomplete .hashtag_box ul li a", function(){
		var srchTag = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "자동완성", "자동완성_연관해시태그", "해시태그_"+srchTag);
	});
	$(document).on("click", ".search_autocomplete .switch.autoword input[id='autoCompleteBtn'] + label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_PC_영문_검색", "자동완성", "자동완성_설정", "자동완성끄기");
		} else {
			GA_Event("click_PC_영문_검색", "자동완성", "자동완성_설정", "자동완성켜키");
		}
	});
	
	// 검색 레이어 닫기
	$(document).on("click", "#header .advanced_search .search_close", function(){
		if ($("#basicSearchTerm").val() == "" && $("#hashSearchTerm").val() == ""){
			GA_Event("click_PC_영문_검색", "검색전", "검색전", "닫기");
		} else {
			GA_Event("click_PC_영문_검색", "자동완성", "자동완성_설정", "닫기");
		}
	});
	

	/** 
	 * 검색결과(일반검색/해시태그검색)
	 */
	if ($("#container").find(".searchcontent_wrap").length > 0){
		var urlParams = new URLSearchParams(window.location.search);

		// 인기검색어(검색결과 없을 시)
		$(document).on("click", ".searchcontent_wrap #noSearchData .hotkey_list .tag a", function(){
			var tagTerm = $(this).find("button").text().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/gi, "").substring(3).replace(/\s/g, "");
			GA_Event("click_PC_영문_검색결과", "검색결과없음", "검색결과없음_인기검색어", "검색어_"+tagTerm);
		});
		
		/* 검색결과 > 일반검색 */
		if (urlParams.get("searchType") == "basic"){
			// 연관검색어
			$(document).on("click", ".searchcontent_wrap .result_list li a", function(){
				var srchTerm = $(this).text().replace(/\s/g, "");
				GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_연관검색어", "검색어_"+srchTerm);
			});

			// 필터 펼치기/닫기
			$(document).on("click", ".searchcontent_wrap .filter_wrap .filter_onoff button", function(){
				if ($(this).parents(".filter_wrap").hasClass("open") == true){
					GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색", "검색필터펼치기");
				} else {
					GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색", "검색필터닫기");
				}
			});

			// 상세필터 - 콘텐츠, 쇼핑정보, 가격, 브랜드, 카테고리 
			$(document).on("click", ".searchcontent_wrap .filter_wrap table td .check_group input[type='checkbox'] + label, .searchcontent_wrap .filter_wrap table td .sort_result input[type='checkbox'] + label", function(){
				var filtTp = $(this).prev("input").attr("name"),
					filtChk = $(this).prev("input").is(":checked"),
					filtNm = $(this).text().replace(/\s/g, "");
				if (filtChk == true){
					if (filtTp == "contentsFilter"){
						GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_취소필터_콘텐츠", "상세취소필터_"+filtNm);
					} else if (filtTp == "shopFilter"){
						GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_취소필터_쇼핑정보", "상세취소필터_"+filtNm);
					} else if (filtTp == "priceFilter"){
						GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_취소필터_가격", "상세취소필터_"+filtNm);
					} else if (filtTp == "branFilter"){ // 브랜드 국문
						GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_취소필터_브랜드", "상세취소필터_"+filtNm);
					} else if (filtTp == "branEngFilter"){ // 브랜드 영문
						GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_취소필터_브랜드", "상세취소필터_"+filtNm);
					} else if (filtTp == "cateFilter"){
						GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_취소필터_카테고리", "상세취소필터_"+filtNm);
					}
				} else {
					if (filtTp == "contentsFilter"){
						GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_필터_콘텐츠", "상세필터_"+filtNm);
					} else if (filtTp == "shopFilter"){
						GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_필터_쇼핑정보", "상세필터_"+filtNm);
					} else if (filtTp == "priceFilter"){
						GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_필터_가격", "상세필터_"+filtNm);
					} else if (filtTp == "branFilter"){ // 브랜드 국문
						GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_필터_브랜드", "상세필터_"+filtNm);
					} else if (filtTp == "branEngFilter"){ // 브랜드 영문
						GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_필터_브랜드", "상세필터_"+filtNm);
					} else if (filtTp == "cateFilter"){
						GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_필터_카테고리", "상세필터_"+filtNm);
					}
				}
			});

			// 검색필터 - 가격, 결과내검색
			var filterPrice = 0, filterSrch = 0;
			$(document).on("change", ".searchcontent_wrap .filter_wrap .input_group1.price .input_w input", function(){
				filterPrice = 1;
			});
			$(document).on("change", ".searchcontent_wrap .filter_wrap .input_group1.search .input_w input", function(){
				filterSrch = 1;
			});
			$(document).on("click", ".searchcontent_wrap .filter_wrap .search_btnarea .search_btn", function(){
				if ($(".searchcontent_wrap .filter_wrap .input_group1.search .input_w input").val() == ""){
					filterSrch = 0;
				}
				
				if (filterPrice == 0 && filterSrch == 0){
					GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_검색필터", "검색");
				} else {
					if (filterPrice == 1){
						var stPr = $(".input_group1.price .input_w input#priceFilterStr").val(),
							endPr = $(".input_group1.price .input_w input#priceFilterEnd").val();
						GA_Event("click_PC_영문_검색결과", "일반검색", "필터_가격_$"+stPr+"~"+endPr, "검색");
					}
					if (filterSrch == 1){
						var srchTerm = $(".input_group1.search .input_w input#filterText").val();
						GA_Event("click_PC_영문_검색결과", "일반검색", "필터_결과내검색_"+srchTerm, "검색");
					}
				}
			});

			// 필터 초기화 버튼
			$(document).on("click", ".searchcontent_wrap .filter_wrap .search_btnarea .reset_btn", function(){
				GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_검색필터", "초기화");
			});

			// 상세필터, 검색필터 취소(/tiles/gd/searchResultFilter.jsp)

			// 필터 전체취소 - 콘텐츠, 쇼핑정보, 가격, 브랜드, 카테고리
			$(document).on("click", ".searchcontent_wrap .filter_wrap table tr .check_all_group .btn_all_x", function(){
				if ($(this).attr("onclick") == "searchTabInit(0);"){
					GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_취소필터_콘텐츠", "전체취소");
				} else if ($(this).attr("onclick") == "searchTabInit(1);"){
					GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_취소필터_쇼핑정보", "전체취소");
				} else if ($(this).attr("onclick") == "searchTabInit(2);"){
					GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_취소필터_가격", "전체취소");
				} else if ($(this).attr("onclick") == "searchTabInit(3);"){
					GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_취소필터_브랜드", "전체취소");
				} else if ($(this).attr("onclick") == "searchTabInit(4);"){
					GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_취소필터_카테고리", "전체취소");
				}
			});

			// 검색결과 정렬기준
			$(document).on("change", ".searchcontent_wrap #filterArea select[id='goodsListOrder']", function(){
				var val = $(this).val();
				if (val == "best"){
					GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_정렬기준", "정렬기준_베스트순");
				} else if (val == "new"){
					GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_정렬기준", "정렬기준_신상품순");
				} else if (val == "priceAsc"){
					GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_정렬기준", "정렬기준_낮은가격순");
				} else if (val == "priceDesc"){
					GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_정렬기준", "정렬기준_높은가격순");
				} else if (val == "dcRate"){
					GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_정렬기준", "정렬기준_높은할인순");
				} else if (val == "grvws"){
					GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_정렬기준", "정렬기준_상품평많은순");
				}
			});

			// 검색결과 상품
			$(document).on("click", ".searchcontent_wrap .product_list .product_itme a", function(){
				var prodNm = $(this).find(".tx_ex").text();
				GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_상품", "상품_"+prodNm);
			});
			// 검색결과 상품 버튼(로그인, 장바구니, 바로구매, 재입고알림)(/js/EN/common.js)
			
			// 검색결과 상품 선택
			$(document).on("click", ".searchcontent_wrap .product_list .product_itme .chk.nolabel input[name='goosChk'] + label", function(){
				GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_상품", "체크박스");
			});
			
			// 검색결과 상품 선택취소 - 일반검색(/sr/searchResult.jsp)

			// 검색결과 선택상품 버튼
			$(document).on("click", ".selectedproduct.addtocart .swiper-button-disabled", function(){
				if ($(this).hasClass("selecteditem-prev") == true){
					GA_Event("click_PC_영문_검색결과", "일반검색_한번에담기", "일반검색_한번에담기", "이전");
				} else if ($(this).hasClass("selecteditem-next") == true){
					GA_Event("click_PC_영문_검색결과", "일반검색_한번에담기", "일반검색_한번에담기", "다음");
				}
			});

			// 검색결과 선택상품 수량
			$(document).on("click", ".selectedproduct.addtocart .selecteditem_swiper .num_amount input[type='button']", function(){
				if ($(this).val() == "-"){
					GA_Event("click_PC_영문_검색결과", "일반검색_한번에담기", "일반검색_한번에담기", "상품수량감소");
				} else if ($(this).val() == "+"){
					GA_Event("click_PC_영문_검색결과", "일반검색_한번에담기", "일반검색_한번에담기", "상품수량증가");
				}
			});

			// 검색결과 선택상품 구매
			$(document).on("click", ".selectedproduct.addtocart .selected_btns > *", function(){
				if ($(this).attr("onclick") == "showLayerMaxDcPrc();"){
					GA_Event("click_PC_영문_검색결과", "일반검색_한번에담기", "일반검색_한번에담기", "적립금혜택엿보기");
				} else if ($(this).attr("onclick") == "addCartSelectGoosList('N');"){
					GA_Event("click_PC_영문_검색결과", "일반검색_한번에담기", "일반검색_한번에담기", "장바구니");
				} else if ($(this).attr("onclick") == "addCartSelectGoosList('Y');"){
					GA_Event("click_PC_영문_검색결과", "일반검색_한번에담기", "일반검색_한번에담기", "바로구매");
				}
			});

			// 검색결과 콘텐츠
			$(document).on("click", ".searchcontent_wrap .product_list li > a", function(){
				if ($(this).find(".searchevent_type").length > 0){
					// 이벤트, 기획전
					var bnnrTp = $(this).attr("href"),
						bnnrNm = $(this).find("strong").text().replace(/\s/g, "");
					if(bnnrTp.indexOf("evnt") > -1){
						GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_콘텐츠", "이벤트_"+bnnrNm);
					} else if(bnnrTp.indexOf("spex") > -1){
						GA_Event("click_PC_영문_검색결과", "일반검색", "일반검색_콘텐츠", "기획전_"+bnnrNm);
					}
				}
			});
			
		/* 검색결과 > 해시태그검색 */
		} else if (urlParams.get("searchType") == "hash"){ 
			// 필터 펼치기/닫기
			$(document).on("click", ".searchcontent_wrap .filter_wrap .filter_onoff button", function(){
				if ($(this).parents(".filter_wrap").hasClass("open") == true){
					GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색", "검색필터펼치기");
				} else {
					GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색", "검색필터닫기");
				}
			});
			
			// 상세필터 - 콘텐츠, 쇼핑정보, 가격, 브랜드, 카테고리
			$(document).on("click", ".searchcontent_wrap .filter_wrap table td .check_group input[type='checkbox'] + label, .searchcontent_wrap .filter_wrap table td .sort_result input[type='checkbox'] + label", function(){
				var filtChk = $(this).prev("input").is(":checked"),
					filtTp = $(this).prev("input").attr("name"),
					filtNm = $(this).text().replace(/\s/g, "");
				if (filtChk == true){
					if (filtTp == "contentsFilter"){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_취소필터_콘텐츠", "상세취소필터_"+filtNm);
					} else if (filtTp == "shopFilter"){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_취소필터_쇼핑정보", "상세취소필터_"+filtNm);
					} else if (filtTp == "priceFilter"){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_취소필터_가격", "상세취소필터_"+filtNm);
					} else if (filtTp == "branFilter"){ // 브랜드 국문
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_취소필터_브랜드", "상세취소필터_"+filtNm);
					} else if (filtTp == "branEngFilter"){ // 브랜드 영문
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_취소필터_브랜드", "상세취소필터_"+filtNm);
					} else if (filtTp == "cateFilter"){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_취소필터_카테고리", "상세취소필터_"+filtNm);
					}
				} else {
					if (filtTp == "contentsFilter"){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_필터_콘텐츠", "상세필터_"+filtNm);
					} else if (filtTp == "shopFilter"){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_필터_쇼핑정보", "상세필터_"+filtNm);
					} else if (filtTp == "priceFilter"){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_필터_가격", "상세필터_"+filtNm);
					} else if (filtTp == "branFilter"){ // 브랜드 국문
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_필터_브랜드", "상세필터_"+filtNm);
					} else if (filtTp == "branEngFilter"){ // 브랜드 영문
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_필터_브랜드", "상세필터_"+filtNm);
					} else if (filtTp == "cateFilter"){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_필터_카테고리", "상세필터_"+filtNm);
					}
				}
			});
			
			// 검색필터 검색 - 가격
			var filterPrice = 0;
			$(document).on("change", ".searchcontent_wrap .filter_wrap .input_group1.price .input_w input", function(){
				filterPrice = 1;
			});
			$(document).on("click", ".searchcontent_wrap .filter_wrap .search_btnarea .search_btn", function(){
				if (filterPrice == 1){
					var stPr = $(".input_group1.price .input_w input#priceFilterStr").val(),
						endPr = $(".input_group1.price .input_w input#priceFilterEnd").val();
					GA_Event("click_PC_영문_검색결과", "해시태그검색", "필터_가격_$"+stPr+"~"+endPr, "검색");
				} else {
					GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_검색필터", "검색");
				}
			});
			
			// 필터 초기화 버튼
			$(document).on("click", ".searchcontent_wrap .filter_wrap .search_btnarea .reset_btn", function(){
				GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_검색필터", "초기화");
			});
			
			// 상세필터, 검색필터 취소(/tiles/gd/searchResultFilter.jsp)

			// 필터 전체취소 - 콘텐츠, 쇼핑정보, 가격, 브랜드, 카테고리
			$(document).on("click", ".searchcontent_wrap .filter_wrap table tr .check_all_group .btn_all_x", function(){
				if ($(this).attr("onclick") == "searchTabInit(0);"){
					GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_취소필터_콘텐츠", "전체취소");
				} else if ($(this).attr("onclick") == "searchTabInit(1);"){
					GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_취소필터_쇼핑정보", "전체취소");
				} else if ($(this).attr("onclick") == "searchTabInit(2);"){
					GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_취소필터_가격", "전체취소");
				} else if ($(this).attr("onclick") == "searchTabInit(3);"){
					GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_취소필터_브랜드", "전체취소");
				} else if ($(this).attr("onclick") == "searchTabInit(4);"){
					GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_취소필터_카테고리", "전체취소");
				}
			});
			
			// 검색결과 정렬기준
			$(document).on("change", ".searchcontent_wrap #filterArea select[id='goodsListOrder']", function(){
				var val = $(this).val();
				if (val == "random"){
					GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_정렬기준", "정렬기준_랜덤보기");
				} else if (val == "group"){
					GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_정렬기준", "정렬기준_그룹보기");
				}
			});

			// 검색결과 상품
			$(document).on("click", ".searchcontent_wrap .product_list .product_itme a", function(){
				var prodNm = $(this).find(".tx_ex").text();
				GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_상품", "상품_"+prodNm);
			});
			// 검색결과 상품 버튼(로그인, 장바구니, 바로구매, 재입고알림)(/js/EN/common.js)
			
			// 검색결과 상품 선택
			$(document).on("click", ".searchcontent_wrap .product_list .product_itme .chk.nolabel input[name='goosChk'] + label", function(){
				GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_상품", "체크박스");
			});
			
			// 검색결과 상품 선택취소 - 해시태그검색(/sr/hashSearchResult.jsp)

			// 검색결과 선택상품 버튼
			$(document).on("click", ".selectedproduct.addtocart .swiper-button-disabled", function(){
				if ($(this).hasClass("selecteditem-prev") == true){
					GA_Event("click_PC_영문_검색결과", "해시태그검색_한번에담기", "해시태그검색_한번에담기", "이전");
				} else if ($(this).hasClass("selecteditem-next") == true){
					GA_Event("click_PC_영문_검색결과", "해시태그검색_한번에담기", "해시태그검색_한번에담기", "다음");
				}
			});

			// 검색결과 선택상품 수량
			$(document).on("click", ".selectedproduct.addtocart .selecteditem_swiper .num_amount input[type='button']", function(){
				if ($(this).val() == "-"){
					GA_Event("click_PC_영문_검색결과", "해시태그검색_한번에담기", "해시태그검색_한번에담기", "상품수량감소");
				} else if ($(this).val() == "+"){
					GA_Event("click_PC_영문_검색결과", "해시태그검색_한번에담기", "해시태그검색_한번에담기", "상품수량증가");
				}
			});

			// 검색결과 선택상품 구매
			$(document).on("click", ".selectedproduct.addtocart .selected_btns > *", function(){
				if ($(this).attr("onclick") == "showLayerMaxDcPrc();"){
					GA_Event("click_PC_영문_검색결과", "해시태그검색_한번에담기", "해시태그검색_한번에담기", "적립금혜택엿보기");
				} else if ($(this).attr("onclick") == "addCartSelectGoosList('N');"){
					GA_Event("click_PC_영문_검색결과", "해시태그검색_한번에담기", "해시태그검색_한번에담기", "장바구니");
				} else if ($(this).attr("onclick") == "addCartSelectGoosList('Y');"){
					GA_Event("click_PC_영문_검색결과", "해시태그검색_한번에담기", "해시태그검색_한번에담기", "바로구매");
				}
			});
			
			// 검색결과 콘텐츠
			$(document).on("click", ".searchcontent_wrap .product_list li > a, .searchcontent_wrap .product_list li button", function(){
				if ($(this).parents("li").hasClass("pord_duble") == true){
					// 이미지, 동영상(영상은 클릭요소 아님)
					var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
					GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_콘텐츠", "콘텐츠_"+bnnrNm);
				} else if ($(this).find(".img_brand").length > 0){
					// 브랜드
					var branNm = $(this).find("img").attr("alt").replace(/\s/g, "");
					GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_콘텐츠", "브랜드_"+branNm);
				} else if ($(this).find(".searchevent_type").length > 0){
					// 사은행사, 세트상품, 세일, 타임세일, 럭키딜, 이벤트, 기획전
					var bnnrTp = $(this).parents("li").find(".searchevent_type"),
						bnnrNm = $(this).find("strong").text().replace(/\s/g, "");
					if (bnnrTp.hasClass("type_gift") == true){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_콘텐츠", "사은행사_"+bnnrNm);
					} else if(bnnrTp.hasClass("type_setProd") == true){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_콘텐츠", "세트상품_"+bnnrNm);
					} else if(bnnrTp.hasClass("type_sale") == true){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_콘텐츠", "세일_"+bnnrNm);
					} else if(bnnrTp.hasClass("type_timeSale") == true){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_콘텐츠", "타임세일_"+bnnrNm);
					} else if(bnnrTp.hasClass("type_lucky") == true){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_콘텐츠", "럭키딜_"+bnnrNm);
					} else if(bnnrTp.hasClass("type_even") == true){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_콘텐츠", "이벤트_"+bnnrNm);
					} else if(bnnrTp.hasClass("type_spec") == true){
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_콘텐츠", "기획전_"+bnnrNm);
					}
				} else if ($(this).parents("li").find(".searchpoint_type").length > 0){
					// 적립금
					var mileTxt = $(this).parents("li").find(".point_txt").text(),
						mileTxt1 = $(this).parents("li").find("em").text(),
						mileTxt2 = $(this).parents("li").find(".point_price").text(),
						mileNm = (mileTxt+"_"+mileTxt1+"_"+mileTxt2).replace(/\s/g, ""),
						mileNmCut = mileNm.substring(0, 20);
					if (mileNm.length > 20){ // 글자수 제한(20자 이상 삭제)
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_콘텐츠", "적립금_"+mileNmCut+"⋯");
					} else {
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_콘텐츠", "적립금_"+mileNm);
					}
				} else if ($(this).parents("li").find(".product_module.coupon").length > 0){
					// 쿠폰
					var coupTxt = $(this).parents("li").find("dl dt").text(),
						coupTxt1 = $(this).parents("li").find("strong").text(),
						coupNm = (coupTxt+"_"+coupTxt1).replace(/\s/g, ""),
						coupNmCut = coupNm.substring(0, 20);
					if (coupNm.length > 20){ // 글자수 제한(20자 이상 삭제)
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_콘텐츠", "쿠폰_"+coupNmCut+"⋯");
					} else {
						GA_Event("click_PC_영문_검색결과", "해시태그검색", "해시태그검색_콘텐츠", "쿠폰_"+coupNm);
					}
				} 
			});
		}
	}


	/** 
	 * 장바구니 (2023-09-13 리뉴얼)
	 */
	// 장바구니 탭
	$(document).on("click", ".wrap-cart .tab-cart-menu > li a", function(){
		if ($(this).attr("id") == "tabCart"){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_탭", "탭_장바구니");
		} else if ($(this).attr("id") == "tabPpdp"){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_탭", "탭_여권출국정보");
		} else if ($(this).attr("id") == "tabOrder"){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_탭", "탭_주문결제");
		}
	});

	// 장바구니 상단
	$(document).on("click", ".wrap-cart .util-cart .util-cart__btn a", function(){
		if ($(this).attr("onclick") == "deleteSelectedCart();"){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상단", "선택삭제");
		} else if ($(this).attr("onclick") == "deleteRostCart();"){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상단", "품절삭제");
		}
	});
	$(document).on("click", ".wrap-cart .util-cart .util-cart__select input[id='rost_cart_chk1'] + label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상단", "품절포함취소");
		} else {
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상단", "품절포함");
		}
	});
	$(document).on("click", ".wrap-cart .util-cart .util-cart__select input[id='cart_chk1'] + label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", "상품전체선택취소");
		} else {
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", "상품전체선택");
		}
	});

	// 장바구니 - 상품 없을 시
	$(document).on("click", ".wrap-cart .list-product__cart .cart__no-item a", function(){
		GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", "상품담으러가기");
	});
	$(document).on("click", ".wrap-cart .wrap-list-cart[id='groobeeRecommend'] .list-product .product__item a", function(){
		GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", "상품추천");
	});
	$(document).on("click", ".wrap-cart .cart__right .bar-login-guide .btn-login__cart", function(){
		GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", "로그인혜택받기");
	});

	// 장바구니 - 상품 있을 시
	// 세트상품
	$(document).on("click", ".wrap-cart .wrap-list-cart .wrap-swiper__set .list-product .product__item a", function(){
		var prodNm1 = $(this).find(".product__brand").text();
		var prodNm2 = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_세트상품", prodNm1+"_"+prodNm2);
	});
	$(document).on("click", ".wrap-cart .wrap-list-cart .wrap-swiper__set + .product__item .option-change__num input[type='button']", function(){
		if ($(this).val() == "-"){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_세트상품", "상품수량감소");
		} else if ($(this).val() == "+"){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_세트상품", "상품수량증가");
		}
	});
	$(document).on("click", ".wrap-cart .wrap-list-cart .wrap-swiper__set + .product__item .product__option button", function(){
		var btnNm = $(this).attr("onclick");
		if (btnNm.indexOf("changeSetGoosQty") > -1){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_세트상품", "수량변경");
		} else if (btnNm.indexOf("goOrder") > -1){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_세트상품", "바로구매");
		} else if (btnNm.indexOf("addAginRecpNtc") > -1){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_세트상품", "재입고알림");
		}
	});
	$(document).on("click", ".wrap-cart .wrap-list-cart .wrap-chk .btn_del", function(){
		GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_세트상품", "상품삭제");
	});

	// 일반상품
	$(document).on("click", ".wrap-cart .list-product__cart .product__item .wrap-product__info .product__link", function(){
		var prodNm1 = $(this).parents(".wrap-product__info").find(".product__brand-info span").text().replace(/\s/g, "");
		var prodNm2 = $(this).parents(".wrap-product__info").find(".product__brand-info").contents().not($(this).children("span")).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", prodNm1+"_"+prodNm2);
	});
	$(document).on("click", ".wrap-cart .list-product__cart .product__buy .option-change__num input[type='button']", function(){
		if ($(this).val() == "-"){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", "상품수량감소");
		} else if ($(this).val() == "+"){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", "상품수량증가");
		}
	});
	$(document).on("click", ".wrap-cart .list-product__cart .product__buy .option-change__num + button", function(){
		var btnNm = $(this).attr("onclick");
		if (btnNm.indexOf("goOrder") > -1){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", "바로구매");
		} else if (btnNm.indexOf("addAginRecpNtc") > -1){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", "재입고알림");
		} 
	});	
	$(document).on("click", ".wrap-cart .list-product__cart .product__item .item_chk .btn_area button", function(){
		if ($(this).hasClass("btn_pin") == true){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", "계속담아두기");
		} else if ($(this).hasClass("btn_like_s") == true){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", "관심상품");
		} else if ($(this).hasClass("btn_del") == true){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", "상품삭제");
		}
	});
	$(document).on("click", ".wrap-cart .list-product__cart .product__item .wrap-product__info .product__brand-option button.type-download", function(){
		var btnNm = $(this).attr("onclick");
		if (btnNm.indexOf("openCouponLayer") > -1){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", "쿠폰받기");
		} else if (btnNm.indexOf("openSvmtLayer") > -1){
			GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_상품", "적립금받기");
		} 
	});	

	// 하단붙박이 버튼
	$(document).on("click", ".wrap-cart .cart__right .wrap-payment .payment-info__low-price .bottom-price__open", function(){ 
		//button[onclick='maxDcAmtInfo();']
		GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_하단붙박이", "최저가엿보기");
	});
	$(document).on("click", ".wrap-cart .cart__right .wrap-payment .payment-info__low-price + .payment-order button[onclick='goOrder();']", function(){
		GA_Event("click_PC_영문_장바구니", "장바구니", "장바구니_하단붙박이", "주문하기");
	});

	// 여권정보 저장하기
	$(document).on("click", ".wrap-cart #psptDpatInfo button[onclick='preSaveData();']", function(){
		GA_Event("click_PC_영문_장바구니", "여권출국정보", "여권출국정보", "저장하기");
	});
	// 출국정보 저장하기(/or/order/addMbshDpatInfo.jsp)


	/** 
	 * 장바구니 > 주문서 (2023-09-13 리뉴얼)
	 */
	// 상단 탭
	if ($(".wrap-cart .type-order-payment .tab-cart-menu li:last-child").hasClass("is-active") == true){
		GA_Event("click_PC_영문_주문서", "주문서", "주문서_탭", "탭_주문결제");
	}
	$(document).on("click", ".wrap-cart .type-order-payment .tab-cart-menu li a", function(){
		if ($(this).attr("href").indexOf("psptTab") > -1){
			GA_Event("click_PC_영문_주문서", "주문서", "주문서_탭", "탭_여권출국정보");
		} else {
			GA_Event("click_PC_영문_주문서", "주문서", "주문서_탭", "탭_장바구니");
		}
	});
	
	// 할인탭 (주문상품, 할인적용, 적립금, 제휴포인트, 예치금/선수금/상품권전환금, 결제방법)
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__head > button", function(){
		var tabTit = $(this).parents('.list-order__head').find('.list-order__tit'),
			tabNm = tabTit.contents().not($(tabTit).children()).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_주문서", "할인", "할인", "할인탭_"+tabNm);
	});

	// 할인탭 - 주문상품
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .list-product__cart .product__item .product__link", function(){
		var prodNm1 = $(this).parents(".wrap-product__info").find(".product__brand-info span").text().replace(/\s/g, "");
		var prodNm2 = $(this).parents(".wrap-product__info").find(".product__brand-info").contents().not($(this).children("span")).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_주문상품", prodNm1+"_"+prodNm2);
	});
	$(document).on("change", ".wrap-cart .wrap-list-order .list-order__content .list-product__cart .product__coupon .wrap-select select", function(){
		var val = $(this).find("option:selected").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_주문상품", "필터_"+val);
	});

	// 할인탭 - 할인적용
	$(document).on("change", ".wrap-cart .wrap-list-order .list-order__content .discount-content .discount-content__unit select[name='geneMbshCupSeq']", function(){
		var val = $(this).val();
		GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_할인적용", "필터_"+val); //장바구니쿠폰
	});
	$(document).on("change", ".wrap-cart .wrap-list-order .list-order__content .discount-content .discount-content__unit select[name='dblMbshCupSeq']", function(){
		var val = $(this).val();
		GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_할인적용", "필터_"+val); //더블쿠폰
	});
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .discount-content .wrap-form__group .wrap-form__radio label input", function(){
		if ($(this).parents('label').find(".txt-label__tit").length > 0){
			var cardNm = $(this).parents('label').find('.txt-label__tit').contents().not($('.txt-label__tit').children("span")).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_할인적용", "카드제휴즉시할인_"+cardNm);
		} else {
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_할인적용", "카드제휴즉시할인_사용안함");
		}
	});
	$(document).on("change", ".wrap-cart .wrap-list-order .list-order__content .discount-content .discount-content__line select[id='ptnrPmptDcType']", function(){
		var val = $(this).val();
		if (val == "001"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_할인적용", "제휴사인증할인_KT");
		} else if (val == "003"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_할인적용", "제휴사인증할인_LGU+");
		}
	});
	
	// 할인탭 - 적립금
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .discount-content .discount-content__line .wrap-form__radio label input[name='pmptUseSvmtUseYn']", function(){
		if ($(this).val() == "Y"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_적립금", "즉시할인적립금_전액사용");
		} else if ($(this).val() == "N"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_적립금", "즉시할인적립금_적립");
		}
	});
	$(document).on("change", ".wrap-cart .wrap-list-order .list-order__content .discount-content .discount-content__line .wrap-form__input input", function(){
		var mileAm = $(this).val();
		if ($(this).attr("name") == "svmtAmt"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_적립금할인", "기본적립금"+mileAm+"원");
		} else if ($(this).attr("name") == "evntSvmtAmt"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_적립금할인", "추가적립금"+mileAm+"원");
		} else if ($(this).attr("name") == "branSvmtAmt"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_적립금할인", "브랜드적립금"+mileAm+"원");
		}
	});
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .discount-content .discount-content__line .wrap-form__input + button", function(){
		if ($(this).attr("onclick").indexOf("allUseSvmtClick();") > -1){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_적립금할인", "전액사용_기본적립금");
		} else if ($(this).attr("onclick").indexOf("allUseEvntSvmtClick();") > -1){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_적립금할인", "전액사용_추가적립금");
		} else if ($(this).attr("onclick").indexOf("allUseBranSvmtClick();") > -1){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_적립금할인", "전액사용_브랜드적립금");
		}
	});

	$(document).on("click", "#ptnsSvmtLayerPopup button[onclick='ptnsPlsSvmtAppl();']", function(){
		var mileAm = $(".wrap-cart .wrap-list-order .list-order__content .discount-content .discount-content__line .wrap-form__input input[id='dispPtnsSvmtAmt']").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_적립금할인", "제휴플러스"+mileAm+"원");
	});
	$(document).on("click", "#settSvmtLayerPopup button[onclick='settPlsSvmtAppl();']", function(){
		var mileAm = $(".wrap-cart .wrap-list-order .list-order__content .discount-content .discount-content__line .wrap-form__input input[id='dispSettSvmtAmt']").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_적립금할인", "결제플러스"+mileAm+"원");
	});
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .discount-content .discount-content__line .wrap-form__input + button", function(){
		if ($(this).attr("onclick").indexOf("plusSvmtLayerPopupOpen('ptns');") > -1){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_적립금할인", "조회사용_제휴플러스");
		} else if ($(this).attr("onclick").indexOf("plusSvmtLayerPopupOpen('sett');") > -1){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_적립금할인", "조회사용_결제플러스");
		}
	});

	// 할인탭 - 제휴포인트
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .discount-content .discount-content__line .wrap-form__radio label input[name='hpoinPlsUseYn']", function(){
		if ($(this).val() == "Y"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_제휴포인트", "H.POINTPLUS_사용");
		} else if ($(this).val() == "N"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_제휴포인트", "H.POINTPLUS_미사용");
		}
	});
	$(document).on("change", ".wrap-cart .wrap-list-order .list-order__content .discount-content .discount-content__line .wrap-form__input input", function(){
		var pointAm = $(this).val();
		if ($(this).attr("name") == "hpoinAmt"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_제휴포인트", "H.POINTPAY"+pointAm+"원");
		} else if ($(this).attr("name") == "ezwelWlfrPoinAmt"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_제휴포인트", "이지웰포인트"+pointAm+"원");
		} else if ($(this).attr("name") == "ezwelSvmtAmt"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_제휴포인트", "이지웰적립금"+pointAm+"원");
		} else if ($(this).attr("name") == "ezwelSpclPoinAmt"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_제휴포인트", "이지웰특별포인트"+pointAm+"원");
		}
	});
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .discount-content .discount-content__line .wrap-form__input + button", function(){
		if ($(this).attr("onclick").indexOf("allUseHpoinClick();") > -1){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_제휴포인트", "전액사용_H.POINTPAY");
		} else if ($(this).attr("onclick").indexOf("allUseEzwelWlfrPoinClick();") > -1){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_제휴포인트", "전액사용_이지웰포인트");
		} else if ($(this).attr("onclick").indexOf("allUseEzwelSvmtClick();") > -1){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_제휴포인트", "전액사용_이지웰적립금");
		} else if ($(this).attr("onclick").indexOf("allUseEzwelSpclPoinClick();") > -1){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_제휴포인트", "전액사용_이지웰특별포인트");
		}
	});

	// 할인탭 - 예치금/선수금/상품권전환금
	$(document).on("change", ".wrap-cart .wrap-list-order .list-order__content .discount-content .discount-content__line .wrap-form__input input", function(){
		var pointAm = $(this).val();
		if ($(this).attr("name") == "cdpstAmt"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_예치금선수금상품권전환금", "예치금"+pointAm+"원");
		} else if ($(this).attr("name") == "advsAmt"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_예치금선수금상품권전환금", "선수금"+pointAm+"원");
		} else if ($(this).attr("name") == "gfcaCdpstAmt"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_예치금선수금상품권전환금", "상품권전환금"+pointAm+"원");
		}
	});
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .discount-content .discount-content__line .wrap-form__input + button", function(){
		if ($(this).attr("onclick").indexOf("allUseCdpstClick();") > -1){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_예치금선수금상품권전환금", "전액사용_예치금");
		} else if ($(this).attr("onclick").indexOf("allUseAdvsClick();") > -1){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_예치금선수금상품권전환금", "전액사용_선수금");
		} else if ($(this).attr("onclick").indexOf("allUseGfcaCdpstClick();") > -1){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_예치금선수금상품권전환금", "전액사용_상품권전환금");
		}
	});

	// 할인탭 - 대한항공스카이패스마일리지적립
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__head .list-order__btn #koreanAir", function(){
		GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_대한항공스카이패스마일리지적립", "조회");
	});
	
	// 할인탭 - 친환경캠페인참여
	$(document).on("click", ".wrap-cart .cart__content .wrap-form__group .wrap-form__radio label input[name='sbagUseYn']", function(){
		if ($(this).val() == "N"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_친환경캠페인참여", "쇼핑백사용안함");
		} else if ($(this).val() == "Y"){
			GA_Event("click_PC_영문_주문서", "할인", "할인_할인탭_친환경캠페인참여", "쇼핑백사용");
		}
	});

	// 할인탭 - 결제정보
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .list-choice-pay > li button", function(){
		var tabNm = $(this).contents().not($(this).children()).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_주문서", "결제정보", "결제정보_탭", "탭_"+tabNm);
	});
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .wrap-choice-pay .list-form__unit label .btn-link a", function(){
		var btnNm = $(this).parents(".list-form__unit").find("input").attr("id");
		if (btnNm == "hpay_01"){
			GA_Event("click_PC_영문_주문서", "결제정보", "결제정보_탭_H.POINTPAY", "hpay카드결제");
		} else if (btnNm == "hpay_02"){
			GA_Event("click_PC_영문_주문서", "결제정보", "결제정보_탭_H.POINTPAY", "hpay계좌이체");
		}
	});
	$(document).on("change", ".wrap-cart .wrap-list-order .list-order__content .wrap-choice-pay .wrap-form__group .wrap-select select", function(){
		GA_Event("click_PC_영문_주문서", "결제정보", "결제정보_탭_신용카드", "카드선택");
	});
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .wrap-choice-pay .wrap-form__group .wrap-select select + #mPoitLayer label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_PC_영문_주문서", "결제정보", "결제정보_탭_신용카드", "포인트사용취소");
		} else {
			GA_Event("click_PC_영문_주문서", "결제정보", "결제정보_탭_신용카드", "포인트사용");
		}
	});
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .wrap-choice-pay .list-easypayment .list-easypayment__unit", function(){
		var payNm = $(this).find(".txt-label").not($(this).children()).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_주문서", "결제정보", "결제정보_탭_간편결제", "간편결제_"+payNm);
	});
	// $(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .wrap-choice-pay .list-form__unit label input", function(){
	// 	var payNm = $(this).parents(".list-form__unit").find(".txt-label").text().replace(/\s/g, "");
	// 	if ($(this).attr("id").indexOf("etcSett") > -1){
	// 		GA_Event("click_PC_영문_주문서", "결제정보", "결제정보_탭_기타결제수단", payNm);
	// 	}
	// });
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .wrap-check input[class='befSettWaySaveYn'] + label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_PC_영문_주문서", "결제정보", "결제정보", "선택한결제수단다음에도사용취소");
		} else {
			GA_Event("click_PC_영문_주문서", "결제정보", "결제정보", "선택한결제수단다음에도사용");
		}
	});
	$(document).on("click", ".wrap-cart .wrap-list-order .list-order__content .cash_receipts .wrap-check input[id='receipt__rcnt'] + label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_PC_영문_주문서", "최종결제", "결제정보", "현금영수증신청취소");
		} else {
			GA_Event("click_PC_영문_주문서", "최종결제", "결제정보", "현금영수증신청");
		}
	});
	$(document).on("click", ".wrap-cart .cart__right .wrap-payment .payment-order button[onclick='goSett();']", function(){
		GA_Event("click_PC_영문_주문서", "결제정보", "결제정보", "결제하기");
	});
	$(document).on("click", ".wrap-cart .cart__right .wrap-payment .payment-check input[id='chkAgree'] + label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_PC_영문_주문서", "최종결제", "결제정보", "주문내역확인동의취소");
		} else {
			GA_Event("click_PC_영문_주문서", "최종결제", "결제정보", "주문내역확인동의");
		}
	});


	/** 
	 * 로그인
	 */
	// 아이디저장 버튼
	$(document).on("click", ".pop_addLgin .id_save .checkbox input[name='saveId'] + label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_PC_영문_로그인", "로그인팝업", "로그인팝업", "아이디저장안함");
		} else {
			GA_Event("click_PC_영문_로그인", "로그인팝업", "로그인팝업", "아이디저장");
		}
	});
	
	// 아이디찾기, 비밀번호찾기
	$(document).on("click", ".pop_addLgin .id_save .find_idpw a", function(){
		if ($(this).attr("id") == "aFindId"){
			GA_Event("click_PC_영문_로그인", "로그인팝업", "로그인팝업", "아이디찿기");
		} else if ($(this).attr("id") == "aFindPwd"){
			GA_Event("click_PC_영문_로그인", "로그인팝업", "로그인팝업", "비밀번호찾기");
		}
	});
	
	// 로그인 버튼
	$(document).on("click", ".pop_addLgin form .btn_login #btnLgin", function(){
		GA_Event("click_PC_영문_로그인", "로그인팝업", "로그인팝업", "로그인");
	});
	
	// H.point통합회원 로그인
	$(document).on("click", ".pop_addLgin .txt_btn button[onclick='hPointLogin()']", function(){
		GA_Event("click_PC_영문_로그인", "로그인팝업_H.Point통합회원", "로그인팝업_H.Point통합회원", "로그인");
	});
	
	// 비회원 버튼
	$(document).on("click", ".pop_addLgin .fix_btn ul li a", function(){
		if ($(this).parent().index() == 0){ 
			GA_Event("click_PC_영문_로그인", "로그인팝업", "로그인팝업_비회원", "비회원_비회원주문");
		} else if ($(this).parent().index() == 1){ 
			GA_Event("click_PC_영문_로그인", "로그인팝업", "로그인팝업_비회원", "비회원_비회원주문조회");
		}
	});
	
	// 비회원 주문조회
	$(document).on("click", "form[name='searchNmbshOrderForm'] .btn_login button", function(){
		GA_Event("click_PC_영문_로그인", "비회원주문조회", "비회원주문조회", "주문조회");
	});	
	
	// 회원가입 버튼
	$(document).on("click", ".pop_addLgin .txt_btn a, form[name='searchNmbshOrderForm'] ~ .txt_btn a", function(){
		GA_Event("click_PC_영문_로그인", "로그인팝업", "로그인팝업", "회원가입");
	});
	
	// 아이디찾기
	$(document).on("click", "form[name='frmMbshFindIdAuth'] .tabcon .basic_btn_box button", function(){
		GA_Event("click_PC_영문_로그인", "아이디찾기", "아이디찾기", "확인");
	});

	// 비밀번호찾기
	$(document).on("click", "form[name='frmMbshFindPwd'] .basic_btn_box button", function(){
		GA_Event("click_PC_영문_로그인", "비밀번호찾기", "비밀번호찾기_아이디조회", "확인");
	});
	// 비밀번호찾기 > 본인인증
	$(document).on("click", "form[name='frmMbshFindPwdAuth'] .find_id .choice_box a", function(){
		if ($(this).find("p").attr("id") == "smsAuca"){
			GA_Event("click_PC_영문_로그인", "비밀번호찾기", "비밀번호찾기_본인인증", "SMS인증");
		} else if ($(this).find("p").attr("id") == "emailAuca"){
			GA_Event("click_PC_영문_로그인", "비밀번호찾기", "비밀번호찾기_본인인증", "이메일인증");
		}
	});
	// 비밀번호찾기 > SMS 인증 팝업
	$(document).on("click", "form[name='frmMbshFindPwdSmsAuth'] .basic_btn_box button", function(){
		GA_Event("click_PC_영문_로그인", "비밀번호찾기", "비밀번호찾기_SMS인증", "취소");
	});
	$(document).on("click", "form[name='frmMbshFindPwdSmsAuth'] #btnConfirm", function(){
		GA_Event("click_PC_영문_로그인", "비밀번호찾기", "비밀번호찾기_SMS인증", "확인");
	});
	// 비밀번호찾기 > 이메일 인증 팝업
	$(document).on("click", "form[name='frmMbshFindPwdEmailAuth'] .basic_btn_box button", function(){
		GA_Event("click_PC_영문_로그인", "비밀번호찾기", "비밀번호찾기_이메일인증", "취소");
	});

	// 비밀번호 변경
	$(document).on("click", "form[name='frmMbshFindPwdChg'] #btnChange", function(){
		GA_Event("click_PC_영문_로그인", "비밀번호찾기", "비밀번호찾기_비밀번호변경", "비밀번호변경");
	});
	
	// 비밀번호 변경완료 버튼
	$(document).on("click", "form[name='frmMbshFindPwdCplt'] .basic_btn_box a", function(){
		if ($(this).attr("id") == "btnMain"){
			GA_Event("click_PC_영문_로그인", "비밀번호찾기", "비밀번호찾기_비밀번호변경완료", "메인");
		} else if ($(this).attr("id") == "btnLogin"){
			GA_Event("click_PC_영문_로그인", "비밀번호찾기", "비밀번호찾기_비밀번호변경완료", "로그인");
		}
	});
	

	/** 
	 * 회원가입(온라인/오프라인)
	 */
	/*(document).on("click", ".join_wrap .type_group .choice_box li #btnUmbJoin", function(){
		GA_Event("click_PC_영문_회원가입_온라인", "온라인", "온라인", "H.point통합회원");
	});
	$(document).on("click", ".join_wrap .type_group .choice_box li a", function(){
		if ($(this).attr("onclick") == "moveTermsAgree('N','KR','N')"){
			GA_Event("click_PC_영문_회원가입_온라인", "온라인", "온라인", "간편회원내국인");
		} else if ($(this).attr("onclick") == "moveTermsAgree('N','KR','Y')"){
			GA_Event("click_PC_영문_회원가입_오프라인", "오프라인", "오프라인", "간편회원내국인");
		}
	});
	$(document).on("click", ".join_wrap .type_group .choice_box li .type_fo_link a", function(){
		if ($(this).attr("onclick") == "moveTermsAgree('Y','KR','N')"){
			GA_Event("click_PC_영문_회원가입_온라인", "온라인", "온라인", "Foreigners_한국어");
		} else if ($(this).attr("onclick") == "moveTermsAgree('Y','EN','N')"){
			GA_Event("click_PC_영문_회원가입_온라인", "온라인", "온라인", "Foreigners_영어");
		} else if ($(this).attr("onclick") == "moveTermsAgree('Y','CN','N')"){
			GA_Event("click_PC_영문_회원가입_온라인", "온라인", "온라인", "Foreigners_중국어");
		} else if ($(this).attr("onclick") == "moveTermsAgree('Y','KR','Y')"){
			GA_Event("click_PC_영문_회원가입_오프라인", "오프라인", "오프라인", "Foreigners_한국어");
		} else if ($(this).attr("onclick") == "moveTermsAgree('Y','EN','Y')"){
			GA_Event("click_PC_영문_회원가입_오프라인", "오프라인", "오프라인", "Foreigners_영어");
		} else if ($(this).attr("onclick") == "moveTermsAgree('Y','CN','Y')"){
			GA_Event("click_PC_영문_회원가입_오프라인", "오프라인", "오프라인", "Foreigners_중국어");
		}
	});*/
	/* S: 2024-02-21 회원가입 리뉴얼 */
	$(document).on("click", ".join_wrap_new .type_group .join_choose li .join_hpoint", function(){
		GA_Event("click_PC_영문_회원가입_온라인", "온라인", "온라인", "H.point통합회원");
	});
	$(document).on("click", ".join_wrap_new .type_group .join_choose li:nth-of-type(2) a", function(){
		GA_Event("click_PC_영문_회원가입_온라인", "온라인", "온라인", "간편회원가입");
	});
	$(document).on("click", ".join_wrap_new .type_group .join_choose li:nth-of-type(3) a", function(){
		GA_Event("click_PC_영문_회원가입_오프라인", "오프라인", "오프라인", "간편회원가입");
	});
	/* E: 2024-02-21 회원가입 리뉴얼 */
	// 회원가입 인트로만 ga4Common.js에 넣고 나머지 스탭별로 각 파일에 스크립트 넣음 (GA4로 주석)
	// 회원가입 > STEP01(/mm/mbshJoin/termsAgree.do)
	// 회원가입 > STEP02(/mm/mbshJoin/authentication.jsp)
	// 회원가입 > STEP03(/mm/mbshJoin/localInformation.jsp)
	// 회원가입 > STEP04(/mm/mbshJoin/joinComplete.jsp)
	

	/** 
	 * 상품상세
	 */
	if ($("#content.productdetail").find(".pd_hshare").length == 0){ // 상품상세(공구특가)와 구분 조건식
		// 상품 브랜드
		$(document).on("click", ".productdetail .pd_visual .summary_info .tit strong a", function(){
			var branNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_상품상세", "상단", "상단", "브랜드_"+branNm);
		});
		
		// 좋아요 버튼
		$(document).on("click", ".productdetail .pd_visual .info_button .wish_popup button", function(){
			GA_Event("click_PC_영문_상품상세", "상단", "상단", "좋아요");
		});

		// 공유하기 버튼
		$(document).on("click", ".productdetail .pd_visual .info_button .sns_popup .sns_link a", function(){
			if ($(this).hasClass("facebook") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단_공유하기", "공유하기_Facebook");
			} else if ($(this).hasClass("blog") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단_공유하기", "공유하기_Blog");
			} else if ($(this).hasClass("kakao") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단_공유하기", "공유하기_KakaoStoryzkzkdh");
			} else if ($(this).hasClass("email") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단_공유하기", "공유하기_Email");
			}
		});
		
		// 상품구매 버튼
		$(document).on("click", ".productdetail .pd_info .button_area .square_tooltip button", function(){
			GA_Event("click_PC_영문_상품상세", "상단", "상단", "적립금혜택엿보기");
		});
		$(document).on("click", ".productdetail .pd_info .button_area a", function(){
			if ($(this).hasClass("addcart") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단", "장바구니");
			} else if ($(this).hasClass("buynow") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단", "바로구매");
			} else if ($(this).hasClass("notifi") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단", "재입고알림");
			}
		});
		
		// 상품정보 탭
		$(document).on("click", ".productdetail .pd_info .layercall li a", function(){
			if ($(this).parent().hasClass("call_panel_a") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단_상세탭", "상세탭_세트상품");
			} else if ($(this).parent().hasClass("call_panel_b") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단_상세탭", "상세탭_사은품");
			}  else if ($(this).parent().hasClass("call_panel_c") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단_상세탭", "상세탭_상품정보");
			}  else if ($(this).parent().hasClass("call_panel_d") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단_상세탭", "상세탭_추천상품");
			}  else if ($(this).parent().hasClass("call_panel_e") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단_상세탭", "상세탭_상품평");
			} 
		});
		$(document).on("click", ".pd_full_layer .tab-style li a", function(){
			if ($(this).parent().hasClass("tab_01") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단_상세탭", "상세탭_세트상품");
			} else if ($(this).parent().hasClass("tab_02") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단_상세탭", "상세탭_사은품");
			}  else if ($(this).parent().hasClass("tab_03") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단_상세탭", "상세탭_상품정보");
			}  else if ($(this).parent().hasClass("tab_04") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단_상세탭", "상세탭_추천상품");
			}  else if ($(this).parent().hasClass("tab_05") == true){
				GA_Event("click_PC_영문_상품상세", "상단", "상단_상세탭", "상세탭_상품평");
			} 
		});
		
		// 상품정보 탭 > 세트상품
		$(document).on("click", ".pd_full_layer .productdetail_01 .product_module .product_itme", function(){
			var prodNm = $(this).find(".price_info p").text();
			GA_Event("click_PC_영문_상품상세", "상세탭_세트상품", "상세탭_세트상품", "상품_"+prodNm);
		});
		$(document).on("click", ".pd_full_layer .productdetail_01 .product_module .price_buybtn a", function(){
			if ($(this).hasClass("buybtn_view") == true){
				GA_Event("click_PC_영문_상품상세", "상세탭_세트상품", "상세탭_세트상품", "구성보기");
			} else if ($(this).hasClass("buybtn_cart") == true){
				GA_Event("click_PC_영문_상품상세", "상세탭_세트상품", "상세탭_세트상품", "장바구니");
			} else if ($(this).hasClass("buybtn_cart") == true){
				GA_Event("click_PC_영문_상품상세", "상세탭_세트상품", "상세탭_세트상품", "세트담기");
			}
		});

		// 상품정보 탭 > 사은품
		$(document).on("click", ".pd_full_layer .productdetail_02 .gift_selection li.item", function(){
			if ($(this).hasClass("open") == true){
				GA_Event("click_PC_영문_상품상세", "상세탭_사은품", "상세탭_사은품", "펼치기");
			} else {
				GA_Event("click_PC_영문_상품상세", "상세탭_사은품", "상세탭_사은품", "닫기");
			}
		});

		// 상품정보 탭 > 상품정보 
		$(document).on("click", ".pd_full_layer .productdetail_03 .brand_info ul li button", function(){
			if ($(this).hasClass("b_notice") == true){
				GA_Event("click_PC_영문_상품상세", "상세탭_상품정보", "상세탭_상품정보", "좋아요");
			} else if ($(this).hasClass("b_favorites") == true){
				GA_Event("click_PC_영문_상품상세", "상세탭_상품정보", "상세탭_상품정보", "알림설정");
			}
		});
		$(document).on("click", ".pd_full_layer .productdetail_03 .basic_information .tel a", function(){
			var btnNm = $(this).find("strong").text().replace(/\s/g, ""),
				btnNm1 = $(this).find("span").text().replace(/\s/g, "");
			GA_Event("click_PC_영문_상품상세", "상세탭_상품정보", "상세탭_상품정보_매장연락처", "매장연락처_"+btnNm+btnNm1);
		});

		// 상품정보 탭 > 추천상품
		$(document).on("click", ".pd_full_layer .productdetail_04 .product_list li a", function(){
			var prodNm = $(this).find(".tx_ex").text();
			if ($(this).parents(".box").hasClass("product_brandbest") == true){
				GA_Event("click_PC_영문_상품상세", "상세탭_추천상품", "상세탭_추천상품_브랜드베스트", "상품_"+prodNm);
			} else if ($(this).parents(".box").hasClass("relatedproducts") == true){
				GA_Event("click_PC_영문_상품상세", "상세탭_추천상품", "상세탭_추천상품_함께본상품", "상품_"+prodNm);
			} 
		});
		$(document).on("click", ".pd_full_layer .productdetail_04 h4 a.link", function(){
			GA_Event("click_PC_영문_상품상세", "상세탭_추천상품", "상세탭_추천상품_브랜드베스트", "브랜드샵바로가기");
		});
		// 브랜드베스트상품, 함께본상품 버튼(로그인, 장바구니, 바로구매, 재입고알림)(/js/EN/common.js)

		// 상품정보 탭 > 상품평
		$(document).on("change", ".pd_full_layer .productdetail_05 .user_review .title select", function(){
			var val = $(this).val();
			if ($(this).attr("id") == "photoGrvwsSort"){
				if (val == "01"){
					GA_Event("click_PC_영문_상품상세", "상세탭_상품평", "상세탭_상품평_포토상품평_정렬기준", "정렬기준_최근등록일순");
				} else if (val == "02"){
					GA_Event("click_PC_영문_상품상세", "상세탭_상품평", "상세탭_상품평_포토상품평_정렬기준", "정렬기준_상품만족도높은순");
				} else if (val == "03"){
					GA_Event("click_PC_영문_상품상세", "상세탭_상품평", "상세탭_상품평_포토상품평_정렬기준", "정렬기준_조회수높은순");
				}
			} else if ($(this).attr("id") == "normalGrvwsSort"){
				if (val == "01"){
					GA_Event("click_PC_영문_상품상세", "상세탭_상품평", "상세탭_상품평_상품평_정렬기준", "정렬기준_최근등록일순");
				} else if (val == "02"){
					GA_Event("click_PC_영문_상품상세", "상세탭_상품평", "상세탭_상품평_상품평_정렬기준", "정렬기준_상품만족도높은순");
				} else if (val == "03"){
					GA_Event("click_PC_영문_상품상세", "상세탭_상품평", "상세탭_상품평_상품평_정렬기준", "정렬기준_조회수높은순");
				}
			}
		});
		$(document).on("click", ".pd_full_layer .productdetail_05 .user_review .title a", function(){
			if ($(this).siblings("#photoGrvwsSort").length > 0){
				if ($(this).hasClass("sub") == true){
					GA_Event("click_PC_영문_상품상세", "상세탭_상품평", "상세탭_상품평_포토상품평", "상품평쓰기");
				} else {
					GA_Event("click_PC_영문_상품상세", "상세탭_상품평", "상세탭_상품평_포토상품평", "내상품평보기");
				}
			} else if ($(this).siblings("#normalGrvwsSort").length > 0){
				if ($(this).hasClass("sub") == true){
					GA_Event("click_PC_영문_상품상세", "상세탭_상품평", "상세탭_상품평_상품평", "상품평쓰기");
				} else {
					GA_Event("click_PC_영문_상품상세", "상세탭_상품평", "상세탭_상품평_상품평", "내상품평보기");
				}
			}
		});
		
		// 쇼핑이용안내 버튼
		$(document).on("click", ".ordertime_btn", function(){
			GA_Event("click_PC_영문_상품상세", "Floating", "Floating", "쇼핑이용안내");
		});
	}


	/** 
	 * 상품상세(공구특가)
	 */
	if ($("#content.productdetail").find(".pd_hshare").length > 0){ // 상품상세(기본)와 구분 조건식
		// 툴팁
		$(document).on("click", ".productdetail .pd_info .pd_hshare .square_tooltip a", function(){
			GA_Event("click_PC_영문_상품상세_공구특가", "상단", "상단_공구특가혜택", "툴팁");
		});

		// 구매안내 버튼
		$(document).on("click", ".productdetail .pd_info .parallelimport_message a", function(){
			if ($(this).parents(".parallelimport_message").hasClass("open") == true){
				GA_Event("click_PC_영문_상품상세_공구특가", "상단", "상단_구매안내", "펼치기");
			} else {
				GA_Event("click_PC_영문_상품상세_공구특가", "상단", "상단_구매안내", "접기");
			}
		});

		// 버튼
		$(document).on("click", ".productdetail .pd_info .button_area a", function(){
			if ($(this).parents(".pd_info").find(".pd_hshare").length > 0){
				if ($(this).attr("id") == "addHSharePtcp"){
					GA_Event("click_PC_영문_상품상세_공구특가", "상단", "상단", "참여하기");
				} else if ($(this).attr("id") == "completeHSharePtcp"){
					GA_Event("click_PC_영문_상품상세_공구특가", "상단", "상단", "참여완료");
				}
			}
		});
	}


	/** 
	 * 브랜드관(브랜드상세)
	 */
	if ($("#container").find(".baseBrand").length > 0){ // 대표브랜드관, 특화관, 템플릿관과 구분 조건식
		var branCd = $(".brandtit_area .btn_area button[id='alarmBtn']").attr("value"),
			branNm = $(".brandtit_area .page_tit").text().replace(/\s/g, "");

		// 상단 버튼
		$(document).on("click", ".brandtit_area .btn_area button", function(){
			if ($(this).attr("id") == "alarmBtn"){
				GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm, branNm+"_상단", "알림설정");
			} else if ($(this).attr("id") == "likeBtn"){
				GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm, branNm+"_상단", "좋아요");
			}
		});

		// 쿠폰, 적립금 받기
		$(document).on("click", ".baseBrand .cuopondown_area .spe_coupon li a", function(){
			var bnnrNm = $(this).parents("li").attr("id");
			if (bnnrNm.indexOf("cup_") > -1){
				GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm, branNm+"_상단_쿠폰", "쿠폰받기");
			} else if (bnnrNm.indexOf("svmt_") > -1){
				GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm, branNm+"_상단_쿠폰", "적립금받기");
			} 
		});

		// 행사배너
		$(document).on("click", ".baseBrand .btm_banner > .banner-swiper .swiper-slide a", function(){
			var bnnrNm = $(this).find(".text p").text().replace(/\s/g, "");
			GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm, branNm+"_브랜드행사배너", "배너_"+bnnrNm);
		});

		// 필터 탭 카테고리
		$(document).on("click", ".baseBrand .tabsort_wrap .branCateList li a", function(){
			var tabNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm, branNm+"_상세탭", "상세탭_"+tabNm);
		});

		// 상세필터  - 쇼핑정보, 가격
		$(document).on("click", ".baseBrand .filter_wrap table td .check_group input[type='checkbox'] + label", function(){
			var tabNm = $(".branCateList li.ui-tabs-active a").text().replace(/\s/g, ""),
				filtChk = $(this).prev("input").is(":checked"),
				filtTp = $(this).prev("input").attr("name"),
				filtNm = $(this).text().replace(/\s/g, "");
			if (filtChk == true){
				if (filtTp == "shopFilter"){
					GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_쇼핑정보", "상세취소필터_"+filtNm);
				} else if (filtTp == "priceFilter"){
					GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_가격", "상세취소필터_"+filtNm);
				}
			} else {
				if (filtTp == "shopFilter"){
					GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_쇼핑정보", "상세필터_"+filtNm);
				} else if (filtTp == "priceFilter"){
					GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_가격", "상세필터_"+filtNm);
				}
			}
		});

		// 검색필터 - 가격
		var filterBran = 0;
		$(document).on("change", ".baseBrand .filter_wrap .input_group1.price .input_w input", function(){
			filterBran = 1;
		});
		$(document).on("click", ".baseBrand .filter_wrap .search_btnarea .search_btn", function(){
			var tabNm = $(".branCateList li.ui-tabs-active a").text().replace(/\s/g, "");
			if(filterBran == 1){
				var stPr = $(".input_group1.price .input_w input#priceFilterStr").val(),
					endPr = $(".input_group1.price .input_w input#priceFilterEnd").val();
				GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_필터_가격_$"+stPr+"~"+endPr, "검색");
			} else {
				GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_검색필터", "검색");
			}
		});

		// 필터 초기화 버튼
		$(document).on("click", ".baseBrand .filter_wrap .search_btnarea .reset_btn", function(){
			var tabNm = $(".branCateList li.ui-tabs-active a").text().replace(/\s/g, "");
			GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_검색필터", "초기화");
		});

		// 상세필터, 검색필터 취소(/tiles/gd/goosFilter.jsp)

		// 필터 전체취소 - 쇼핑정보, 가격
		$(document).on("click", ".baseBrand .filter_wrap table tr .check_all_group .btn_all_x", function(){
			var tabNm = $(".branCateList li.ui-tabs-active a").text().replace(/\s/g, "");
			if ($(this).attr("onclick") == "searchTabInit(1);"){
				GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_쇼핑정보", "전체취소");
			} else if ($(this).attr("onclick") == "searchTabInit(2);"){
				GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_가격", "전체취소");
			}
		});

		// 검색결과 정렬기준
		$(document).on("change", ".baseBrand .sorting_wrap select[id='goodsListOrder']", function(){
			var val = $(this).val(),
				tabNm = $(".branCateList li.ui-tabs-active a").text().replace(/\s/g, "");
			if (val == "best"){
				GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_정렬기준", "정렬기준_베스트순");
			} else if (val == "new"){
				GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_정렬기준", "정렬기준_신상품순");
			} else if (val == "priceAsc"){
				GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_정렬기준", "정렬기준_낮은가격순");
			} else if (val == "priceDesc"){
				GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_정렬기준", "정렬기준_높은가격순");
			} else if (val == "dcRate"){
				GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_정렬기준", "정렬기준_높은할인순");
			} else if (val == "grvws"){
				GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_정렬기준", "정렬기준_상품평많은순");
			}
		});

		// 검색결과 상품
		$(document).on("click", ".baseBrand .product_list.goosMoreArea li a", function(){
			var tabNm = $(".branCateList li.ui-tabs-active a").text().replace(/\s/g, ""),
				prodNm = $(this).find("img").attr("alt");
			GA_Event("click_PC_영문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_상품", "상품_"+prodNm);
		});
		// 검색결과 상품 버튼(로그인, 장바구니, 바로구매, 재입고알림)(/js/EN/common.js)
	}


	/** 
	 * 대표브랜드관
	 */
	if ($("#container").find(".reprBrand").length > 0){ // 브랜드관(기본), 특화관, 템플릿관과 구분 조건식
		var branCd = $(".brandtit_area .heart-motion").attr("onclick").replace(/[^0-9]/gi,""),
			branNm = $(".brandtit_area .page_tit").text().replace(/\s/g, "");

		// 메인배너
		$(document).on("click", ".reprBrand .spacialbanner .swiper-slide", function(){
			var bnnrNm = $(this).find(".text p").text().replace(/\s/g, "");
			GA_Event("click_PC_영문_대표브랜드관_"+branCd, branNm, branNm+"_메인배너", "배너_"+bnnrNm);
		});
		
		// 중간배너
		$(document).on("click", ".reprBrand .brandshop_slide .product_module .product_itme a", function(){
			var branNm = $(this).find("em").text().replace(/\s/g, "");
			GA_Event("click_PC_영문_대표브랜드관_"+branCd, branNm, branNm+"_중간배너", "배너_"+branNm);
		});

		// 행사배너
		$(document).on("click", ".reprBrand .btm_banner .banner-swiper .swiper-slide a", function(){
			var bnnrNm = $(this).find(".text").text().replace(/\s/g, "");
			GA_Event("click_PC_영문_대표브랜드관_"+branCd, branNm, branNm+"_브랜드행사배너", "배너_"+bnnrNm);
		});
		
		// 브랜드 탭
		$(document).on("click", ".reprBrand .tabsort_wrap .branCateList li a", function(){
			var tabNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_대표브랜드관_"+branCd, branNm, branNm+"_탭", "탭_"+tabNm);
		});
		
		// 브랜드 상품
		$(document).on("click", ".reprBrand .product_list li a", function(){
			var prodNm = $(this).find("img").attr("alt");
			GA_Event("click_PC_영문_대표브랜드관_"+branCd, branNm, branNm+"_상품", "상품_"+prodNm);
		});
	}


	/** 
	 * 특화관
	 */
	if ($("#container").find(".special_content").length > 0){ // 브랜드관(기본), 대표브랜드관, 템플릿관과 구분 조건식
		var urlParams = new URLSearchParams(window.location.search),
			spclId = urlParams.get("spclMenuSeq"),
			spclNm = $(".special_content .page_tit").text().replace(/\s/g, "");
		
		// 매인배너
		$(document).on("click", ".special_content .spacialbanner .swiper-slide", function(){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_PC_영문_특화관_"+spclId, spclNm, spclNm+"_메인배너", "메인배너_"+bnnrNm);
		});
		
		// 영상영역
		$(document).on("click", ".special_content .spe_edit .box video", function(){
			var bnnrNm = $(this).parents(".spe_edit").find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_PC_영문_특화관_"+spclId, spclNm, spclNm+"_메인배너", "메인배너_"+bnnrNm);
		});
		
		// 해시태그
		$(document).on("click", ".special_content .spe_hashtag .tag_group a", function(){
			var tagTerm = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_특화관_"+spclId, spclNm, spclNm+"_해시태그", "해시태그_"+tagTerm);
		});
		
		// 쿠폰
		$(document).on("click", ".special_content .spe_coupon li", function(){
			var coupTxt = $(this).find(".square_coupon > p").text(),
				coupTxt1 = $(this).find(".square_coupon dl dt").text(),
				coupNm = (coupTxt+"_"+coupTxt1).replace(/\s/g, ""),
				coupNmCut = coupNm.substring(0, 20);
			if (coupNm.length > 20){ // 글자수 제한(20자 이상 삭제)
				GA_Event("click_PC_영문_특화관_"+spclId, spclNm, spclNm+"_쿠폰", "쿠폰_"+coupNmCut+"⋯");
			} else {
				GA_Event("click_PC_영문_특화관_"+spclId, spclNm, spclNm+"_쿠폰", "쿠폰_"+coupNm);
			}
		});
		
		// 세트상품
		$(document).on("click", ".special_content .spe_sets .product_module .product_itme > a", function(){
			var prodNm = $(this).find("img").attr("alt");
			GA_Event("click_PC_영문_특화관_"+spclId, spclNm, spclNm+"_세트상품", "상품_"+prodNm);
		});
		$(document).on("click", ".special_content .spe_sets .product_module .product_itme .price_buybtn a", function(){
			if ($(this).hasClass("buybtn_view") == true){
				GA_Event("click_PC_영문_특화관_"+spclId, spclNm, spclNm+"_세트상품", "구성보기");
			} else if ($(this).hasClass("buybtn_cart") == true && $(this).hasClass("set") == true){
				GA_Event("click_PC_영문_특화관_"+spclId, spclNm, spclNm+"_세트상품", "세트담기");
			} else if ($(this).hasClass("buybtn_cart") == true){
				GA_Event("click_PC_영문_특화관_"+spclId, spclNm, spclNm+"_세트상품", "장바구니");
			}
		});
		
		// 추천브랜드
		$(document).on("click", ".special_content .recommend_brand .product_module .product_itme a", function(){
			var branNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_PC_영문_특화관_"+spclId, spclNm, spclNm+"_추천브랜드", "브랜드_"+branNm);
		});
		
		// 추천상품
		$(document).on("click", ".special_content .recommend_products .product_list li a", function(){
			var prodNm = $(this).find("img").attr("alt");
			GA_Event("click_PC_영문_특화관_"+spclId, spclNm, spclNm+"_추천상품", "상품_"+prodNm);
		});
		
		// 상품리스트
		$(document).on("click", ".special_content .product_list.goosMoreArea .product_itme.goosList a", function(){
			var prodNm = $(this).find("img").attr("alt");
			GA_Event("click_PC_영문_특화관_"+spclId, spclNm, spclNm+"_상품리스트", "상품_"+prodNm);
		});
	}


	/** 
	 * 템플릿관(기본형/확장형)
	 */
	if ($("#container").find(".shop_tmpl").length > 0){ // 브랜드관(기본), 대표브랜드관, 템플릿관과 구분 조건식
		var branCd = $(this).find(".shop_title_wrap button[id='alarmBtn']").attr("value"),
			branNm = $(this).find(".shop_title_wrap h2 img").attr("alt").replace(/\s/g, "");

		/* 템플릿관 > 기본형 */
		// 상단버튼
		$(document).on("click", ".basic .shop_title_wrap .util button", function(){
			if ($(this).attr("id") == "alarmBtn"){
				GA_Event("click_PC_영문_템플릿관_"+branCd, branNm+"_기본형", branNm+"_기본형_상단", "알림설정");
			} else if ($(this).hasClass("heart-motion") == true){
				GA_Event("click_PC_영문_템플릿관_"+branCd, branNm+"_기본형", branNm+"_기본형_상단", "좋아요");
			}
		});
		
		// 메인배너
		$(document).on("click", ".basic .main_banner ul li a", function(){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_PC_영문_템플릿관_"+branCd, branNm+"_기본형", branNm+"_기본형_메인배너", "배너_"+bnnrNm);
		});
		
		// 분할배너
		$(document).on("click", ".basic .banner_con div a", function(){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_PC_영문_템플릿관_"+branCd, branNm+"_기본형", branNm+"_기본형_분할배너_하단", "배너_"+bnnrNm);
		});

		/* 템플릿관 > 확장형 */
		// 상단버튼
		$(document).on("click", ".expand .shop_title_wrap .util button", function(){
			if ($(this).attr("id") == "alarmBtn"){
				GA_Event("click_PC_영문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_상단", "알림설정");
			} else if ($(this).hasClass("heart-motion") == true){
				GA_Event("click_PC_영문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_상단", "좋아요");
			}
		});
		
		// 상세탭
		$(document).on("click", ".expand .shop_menu_wrap .depth1_wrap .depth1_con a", function(){
			var tabNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_상단_상세탭", "상세탭_"+tabNm);
		});

		// 메인배너
		$(document).on("click", ".expand .main_banner .banner_slide ul li a", function(){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_PC_영문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_메인배너", "배너_"+bnnrNm);
		});
		
		// 분할배너
		$(document).on("click", ".expand .banner_con div a", function(){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_PC_영문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_분할배너_상단", "배너_"+bnnrNm);
		});
		
		// 베스트상품
		$(document).on("click", ".expand .best_con .prd_slide_wrap .product_list li a", function(){
			var prodNm = $(this).find("img").attr("alt");
			GA_Event("click_PC_영문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_베스트상품", "상품_"+prodNm);
		});
		
		// 이미지영역
		$(document).on("click", ".expand .banner_wide_con .banner_slide li a", function(){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_PC_영문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_이미지영역", "배너_"+bnnrNm);
		});
		
		// 상품영역
		$(document).on("click", ".expand .hot_sale_con .prd_slide_wrap .product_list li a", function(){
			var prodNm = $(this).find("img").attr("alt");
			GA_Event("click_PC_영문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_할인상품", "상품_"+prodNm);
		});
	}


	/**
	 * 명품관 > 에스티로더(022901)
	 */
	// GNB - depth01
	$(document).on("click", "#el_wrapper .header .gnb > ul > li > a", function(){
		var gnbNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_022901", "에스티로더", "에스티로더_카테고리메뉴", "카테고리메뉴_"+gnbNm);
	});
	// GNB - depth02
	$(document).on("click", "#el_wrapper .header .gnb > ul > li .gnbsub div.section ul li a", function(){
		var gnbNm = $(this).parents(".gnbsub").siblings("a").find("img").attr("alt").replace(/\s/g, "");
		if ($(this).parents(".section").find("h3").length > 0){
			var gnbNm1 = $(this).parents(".section").find("h3 img").attr("alt").replace(/\s/g, ""),
				gnbNm2 = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_명품관_022901", "에스티로더", "에스티로더_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1+"_"+gnbNm2);			
		} else {
			gnbNm1 = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_명품관_022901", "에스티로더", "에스티로더_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);	
		}
	});
	// GNB - depth02 all
	$(document).on("click", "#el_wrapper .header .gnb > ul > li .gnbsub h3.all a", function(){
		var gnbNm = $(this).parents(".gnbsub").siblings("a").find("img").attr("alt").replace(/\s/g, ""),
			gnbNm1 = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_022901", "에스티로더", "에스티로더_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);
	});

	// 카테고리
	$(document).on("click", "#el_wrapper .m_contents .section2 a", function(){ // 선택자 불안정
		var gnbNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_022901", "에스티로더", "에스티로더_카테고리메뉴", "카테고리메뉴_"+gnbNm);
	});

	// 배너 - 상단배너, 메인배너, 중간배너
	$(document).on("click", "#el_wrapper .tbanner a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_022901", "에스티로더", "에스티로더_상단배너", "배너_"+bnnrNm);
	});
	$(document).on("click", "#el_wrapper .m_contents #main_slides .el_bxslider li a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_022901", "에스티로더", "에스티로더_메인배너", "배너_"+bnnrNm);
	});
	$(document).on("click", "#el_wrapper .m_contents .section > a", function(){ // 선택자 불안정
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_022901", "에스티로더", "에스티로더_중간배너", "배너_"+bnnrNm);
	});

	// 베스트셀러 상품
	$(document).on("click", "#el_wrapper .m_contents .section .bannerLink1 area", function(){  // 선택자 불안정
		var bnnrNm = $(this).attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_022901", "에스티로더", "에스티로더_베스트셀러", "상품_"+bnnrNm);
	});


	/**
	 * 명품관 > 클라랑스(005701)
	 */
	// GNB - depth01
	$(document).on("click", ".clarins-wrap .clarins-gnb > ul > li > a", function(){
		var gnbNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_005701", "클라랑스", "클라랑스_카테고리메뉴", "카테고리메뉴_"+gnbNm);
	});
	// GNB - depth02
	$(document).on("click", ".clarins-wrap .clarins-gnb > ul > li > a + ul > li > a", function(){
		var gnbNm = $(this).parents("ul").siblings("a").text().replace(/\s/g, ""),
			gnbNm1 = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_005701", "클라랑스", "클라랑스_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);
	});
	// GNB - depth03
	$(document).on("click", ".clarins-wrap .clarins-gnb ul.clarins-has-depth3 li a + ul li a", function(){
		var gnbNm = $(this).parents("ul.clarins-has-depth3").siblings("a").text().replace(/\s/g, ""),
			gnbNm1 = $(this).parent("li").parent("ul").siblings("a").text().replace(/\s/g, ""),
			gnbNm2 = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_005701", "클라랑스", "클라랑스_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1+"_"+gnbNm2);
	});
	
	// 카테고리
	$(document).on("click", ".clarins-wrap .clarins-card-items .clarins-item .clarins-thumb", function(){
		var gnbNm = $(this).parent().find(".clarins-name").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_005701", "클라랑스", "클라랑스_카테고리", "카테고리_"+gnbNm);
	});

	// 배너 - 메인배너, 하단배너
	$(document).on("click", ".clarins-wrap .clarins-mainBanner .swiper-slide a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_005701", "클라랑스", "클라랑스_메인배너", "배너_"+bnnrNm);
	});
	$(document).on("click", ".clarins-footerBanner a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_005701", "클라랑스", "클라랑스_하단배너", "배너_"+bnnrNm);
	});

	// 상품 - 신제품, 베스트셀러
	$(document).on("click", ".clarins-wrap .clarins-slider-1 .clarins-item", function(){
		var prodNm = $(this).find("img").attr("alt");
		GA_Event("click_PC_영문_명품관_005701", "클라랑스", "클라랑스_신제품", "상품_"+prodNm);
	});
	$(document).on("click",  ".clarins-wrap .clarins-slider-2 .clarins-item", function(){
		var prodNm = $(this).find("img").attr("alt");
		GA_Event("click_PC_영문_명품관_005701", "클라랑스", "클라랑스_베스트셀러", "상품_"+prodNm);
	});


	/**
	 * 명품관 > 랑콤(006301)
	 */
	// GNB - depth01
	$(document).on("click", ".lancome_header .lancome_header_tab_list .lancome_header_tab > a", function(){
		var gnbNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_006301", "랑콤", "랑콤_카테고리메뉴", "카테고리메뉴_"+gnbNm);
	});
	// GNB - depth02
	$(document).on("click", ".lancome_header .dropdown-list-container .dropdown-inner .inner-menu .dropdown-list .list_title", function(){
		var gnbCd = $(this).parents(".dropdown-list-container").attr("data-tabindex"),
			gnbNm = $(".lancome_header .lancome_header_tab_list .lancome_header_tab[data-tabindex='"+gnbCd+"']").find("a").text().replace(/\s/g, ""),
			gnbNm1 = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_006301", "랑콤", "랑콤_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);
	});
	// GNB - depth03
	$(document).on("click", ".lancome_header .dropdown-list-container .dropdown-inner .inner-menu .dropdown-list .list_item", function(){
		var gnbCd = $(this).parents(".dropdown-list-container").attr("data-tabindex"),
			gnbNm = $(".lancome_header .lancome_header_tab_list .lancome_header_tab[data-tabindex='"+gnbCd+"']").find("a").text().replace(/\s/g, ""),
			gnbNm1 = $(this).siblings(".list_title").find("a").text().replace(/\s/g, ""),
			gnbNm2 = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_006301", "랑콤", "랑콤_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1+"_"+gnbNm2);
	});
	// GNB - 상품배너 상품 바로구매
	$(document).on("click", ".lancome_header .dropdown-list-container .dropdown-inner .inner-img a", function(){
		var gnbCd = $(this).parents(".dropdown-list-container").attr("data-tabindex"),
			gnbNm = $(".lancome_header .lancome_header_tab_list .lancome_header_tab[data-tabindex='"+gnbCd+"']").find("a").text().replace(/\s/g, ""),
			prodNm = $(this).find("img").attr("alt");
		GA_Event("click_PC_영문_명품관_006301", "랑콤", "랑콤_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_상품_"+prodNm);
	});
	// GNB(제니피끄) - 상품 바로구매
	$(document).on("click", ".lancome_header .dropdown-list-container .dropdown-container div[class^='container-'] .box-wrap a", function(){
		var gnbCd = $(this).parents(".dropdown-list-container").attr("data-tabindex"),
			gnbNm = $(".lancome_header .lancome_header_tab_list .lancome_header_tab[data-tabindex='"+gnbCd+"']").find("a").text().replace(/\s/g, ""),
			prodNm = $(this).parents(".box-wrap").find(".dropdown-para01").text();
		GA_Event("click_PC_영문_명품관_006301", "랑콤", "랑콤_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_상품_"+prodNm);
	});

	// 카테고리
	$(document).on("click", ".lancome_homepage .lancome_bottom_section .lancome_category_btn a", function(){
		var gnbNm = $(this).find("i.hide").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_006301", "랑콤", "랑콤_카테고리", "카테고리_"+gnbNm);
	});

	// 배너 - 메인배너, 중간배너
	$(document).on("click", ".lancome_homepage #lancome_homepage_carousel .slick-slide a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_006301", "랑콤", "랑콤_메인배너", "배너_"+bnnrNm);
	});
	$(document).on("click", ".lancome_homepage .lancome_promotion_banner .slick-slide a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_006301", "랑콤", "랑콤_중간배너", "배너_"+bnnrNm);
	});

	// 상품 - 베스트셀러, 중간컨텐츠상품, 중간컨텐츠상품 버튼
	$(document).on("click", ".lancome_homepage .lancome_bottom_carousel .lancome_bottom_carousel_btn a", function(){
		var prodNm = $(this).text();
		GA_Event("click_PC_영문_명품관_006301", "랑콤", "랑콤_베스트셀러", "상품_"+prodNm);
	});
	$(document).on("click", ".lancome_homepage .lancome_homepage_product_container .lancome_homepage_product_img", function(){
		var prodNm = $(this).find("img").attr("alt");
		GA_Event("click_PC_영문_명품관_006301", "랑콤", "랑콤_중간컨텐츠_상품", "상품_"+prodNm);
	});
	$(document).on("click", ".lancome_homepage .lancome_homepage_product_container .lancome_homepage_product_btns > a", function(){
		if ($(this).hasClass("lancome_plp_product_addToCartbtn") == true){
			GA_Event("click_PC_영문_명품관_006301", "랑콤", "랑콤_중간컨텐츠_상품", "장바구니");
		} else if ($(this).hasClass("lancome_plp_product_buybtn") == true){
			GA_Event("click_PC_영문_명품관_006301", "랑콤", "랑콤_중간컨텐츠_상품", "바로구매");
		}
	});


	/**
	 * 명품관 > 겔랑(005601)
	 */
	// GNB - depth01
	$(document).on("click", ".guerlain-wrap .menu-wrapper .navbar-nav > li > a", function(){
		var gnbNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_005601", "겔랑", "겔랑_카테고리메뉴", "카테고리메뉴_"+gnbNm);
	});
	// GNB - depth02
	$(document).on("click", ".guerlain-wrap .menu-wrapper .navbar-nav .sub-menu .sub-menu-item ul li:nth-child(1) a", function(){
		var gnbNm = $(this).parents(".sub-menu").siblings("a").text().replace(/\s/g, ""),
			gnbNm1 = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_005601", "겔랑", "겔랑_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);
	});
	// GNB - depth03
	$(document).on("click", ".guerlain-wrap .menu-wrapper .navbar-nav .sub-menu .sub-menu-item ul li:not(:first-child) a", function(){
		var gnbNm = $(this).parents(".sub-menu").siblings("a").text().replace(/\s/g, ""),
			gnbNm1 = $(this).parents(".sub-menu-item").find("ul li:nth-child(1) a").text().replace(/\s/g, ""),
			gnbNm2 = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_005601", "겔랑", "겔랑_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1+"_"+gnbNm2);
	});

	// 카테고리
	$(document).on("click", ".guerlain-wrap .guerlain-card-items .guerlain-item", function(){
		var gnbNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_005601", "겔랑", "겔랑_카테고리", "카테고리_"+gnbNm);
	});

	// 배너 - 상단배너(구조확인불가), 메인배너, 중간배너, 브랜드스토리더보기 버튼
	$(document).on("click", ".guerlain-wrap .guerlain-mainBanner .guerlain-thumb", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_005601", "겔랑", "겔랑_메인배너", "배너_"+bnnrNm);
	});
	$(document).on("click", ".guerlain-wrap .guerlain-mainBanner .guerlain-link-more", function(){
		GA_Event("click_PC_영문_명품관_005601", "겔랑", "겔랑_중간배너", "배너_브랜드스토리더보기");
	});

	// 상품 - 신제품, 베스트셀러
	$(document).on("click", ".guerlain-wrap .guerlain-slider-1 .guerlain-pdt-items .guerlain-item", function(){
		var prodNm = $(this).find("img").attr("alt");
		GA_Event("click_PC_영문_명품관_005601", "겔랑", "겔랑_신제품", "상품_"+prodNm);
	});
	$(document).on("click", ".guerlain-wrap .guerlain-slider-2 .guerlain-pdt-items .guerlain-item", function(){
		var prodNm = $(this).find("img").attr("alt");
		GA_Event("click_PC_영문_명품관_005601", "겔랑", "겔랑_베스트셀러", "상품_"+prodNm);
	});

	
	/**
	 * 명품관 > 조말론(025501)
	 */
	// GNB - depth01
	$(document).on("click", ".jmwrap .jmheader .gnb .gnb_column > h2 > a, .jmwrap .jmcontents .mainbanner li a", function(){
		var gnbNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025501", "조말론", "조말론_카테고리메뉴", "카테고리메뉴_"+gnbNm);
	});
	// GNB - depth02
	$(document).on("click", ".jmwrap .jmheader .gnb .gnb_column .gnb_sub > ul > li > a", function(){
		var gnbNm = $(this).parents(".gnb_sub").siblings("h2").find("a img").attr("alt").replace(/\s/g, ""),
			gnbNm1 = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025501", "조말론", "조말론_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);
	});
	// GNB - depth03
	$(document).on("click", ".jmwrap .jmheader .gnb .gnb_column .gnb_sub h3 + ul li a", function(){
		var gnbNm = $(this).parents(".gnb_sub").siblings("h2").find("a img").attr("alt").replace(/\s/g, ""),
			gnbNm1 = $(this).parents("ul").siblings("h3").find("img").attr("alt").replace(/\s/g, ""),
			gnbNm2 = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025501", "조말론", "조말론_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1+"_"+gnbNm2);
	});
	
	// 메인배너
	$(document).on("click", ".jmwrap .jmcontents #slides .slides_container .slide a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025501", "조말론", "조말론_메인배너", "배너_"+bnnrNm);
	});
	

	/**
	 * 명품관 > 톰포드(027102)
	 */
	// GNB
	$(document).on("click", ".tf_wrap .tf_gnb > .gnb_column a", function(){
		if ($(this).parents(".gnb_column").find("ul").length > 0){
			// depth02
			var gnbNm = $(this).parents("ul").siblings("a").text().replace(/\s/g, ""),
				gnbNm1 = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_명품관_027102", "톰포드", "톰포드_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);
		} else {	
			// depth01		
			var gnbNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_명품관_027102", "톰포드", "톰포드_카테고리메뉴", "카테고리메뉴_"+gnbNm);
		}
	});

	// 배너 - 상단배너, 메인배너
	$(document).on("click", ".tf_wrap .tf_contents .banner_wrap .visual a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_027102", "톰포드", "톰포드_상단배너", "배너_"+bnnrNm);
	});
	$(document).on("click", ".tf_wrap .tf_contents .banner_wrap div[class^='banner_'] a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_027102", "톰포드", "톰포드_메인배너", "배너_"+bnnrNm);
	});


	/**
	 * 명품관 > 라메르(025301)
	 */
	// GNB - depth01
	$(document).on("click", "#lamerwrap .header .gnb > ul > li > a", function(){
		var gnbNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025301", "라메르", "라메르_카테고리메뉴", "카테고리메뉴_"+gnbNm);
	});
	// GNB - depth02
	$(document).on("click", "#lamerwrap .header .gnb > ul > li.hassub ul li a", function(){
		var gnbNm = $(this).parents("ul").siblings("a").find("img").attr("alt").replace(/\s/g, ""),
			gnbNm1 = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025301", "라메르", "라메르_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);
	});

	// 배너 - 상단배너, 메인배너, 중간배너
	$(document).on("click", "#lamerwrap .header .tban", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025301", "라메르", "라메르_상단배너", "배너_"+bnnrNm);
	});
	$(document).on("click", "#lamerwrap .mcontent #slides .slides_container .slide a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025301", "라메르", "라메르_메인배너", "배너_"+bnnrNm);
	});
	$(document).on("click", "#lamerwrap .mcontent .section > a", function(){ // 선택자 불안정
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025301", "라메르", "라메르_중간배너", "배너_"+bnnrNm);
	});

	// 중간컨텐츠상품
	$(document).on("click", "#lamerwrap .mcontent .section #bannerLink1 area", function(){ // 선택자 불안정
		var prodNm = $(this).attr("alt");
		GA_Event("click_PC_영문_명품관_025301", "라메르", "라메르_중간컨텐츠_상품", "상품_"+prodNm);
	});
	

	/**
	 * 명품관 > 달팡(026901)
	 */
	// GNB - depth01
	$(document).on("click", "#darphin_wrap .header .gnb > ul > li > a", function(){
		var gnbNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026901", "달팡", "달팡_카테고리메뉴", "카테고리메뉴_"+gnbNm);
	});
	// GNB - depth02
	$(document).on("click", "#darphin_wrap .header .gnb .gnbsub ul li a", function(){
		var gnbNm = $(this).parents(".gnbsub").siblings("a").find("img").attr("alt").replace(/\s/g, ""),
			gnbNm1 = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026901", "달팡", "달팡_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);
	});

	// 배너 - 상단배너, 메인배너, 중간배너, 하단배너
	$(document).on("click", "#darphin_wrap .header .tbanner a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026901", "달팡", "달팡_상단배너", "배너_"+bnnrNm);
	});
	$(document).on("click", "#darphin_wrap .maincontents .section .bxslider li a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026901", "달팡", "달팡_메인배너", "배너_"+bnnrNm);
	});
	$(document).on("click", "#darphin_wrap .maincontents .section > a", function(){ // 선택자 불안정
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026901", "달팡", "달팡_중간배너", "배너_"+bnnrNm);
	});
	$(document).on("click", "#darphin_wrap .maincontents .section2 > a", function(){ // 선택자 불안정
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026901", "달팡", "달팡_하단배너", "배너_"+bnnrNm);
	});

	// 베스트셀러 상품
	$(document).on("click", "#darphin_wrap .maincontents .section #bestLink1 area", function(){ // 선택자 불안정
		var prodNm = $(this).attr("alt");
		GA_Event("click_PC_영문_명품관_026901", "달팡", "달팡_베스트셀러", "상품_"+prodNm);
	});


	/** 
	 * 명품관 > 크리니크(025701)
	 */
	// GNB - depth01
	$(document).on("click", ".cl_wrap .cl_header .gnb .gnb_column h2 a", function(){
		var gnbNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025701", "크리니크", "크리니크_카테고리메뉴", "카테고리메뉴_"+gnbNm);
	});
	// GNB - depth02
	$(document).on("click", ".cl_header .gnb .gnb_column .gnb_sub a", function(){
		var gnbNm = $(this).parents(".gnb_column").find("h2 a").text().replace(/\s/g, ""),
			gnbNm1 = $(this).text().replace(/\s/g, "")
		GA_Event("click_PC_영문_명품관_025701", "크리니크", "크리니크_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);
	});
	
	// 배너 - 상단배너, 메인배너, 중간배너
	$(document).on("click", ".cl_wrap.cl_header .tbanner a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025701", "크리니크", "크리니크_상단배너", "배너_"+bnnrNm);
	});
	$(document).on("click", ".cl_wrap #slides .bx-wrapper li a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025701", "크리니크", "크리니크_메인배너", "배너_"+bnnrNm);
	});
	$(document).on("click", ".cl_wrap .mban_wrap .mbanner a, .cl_wrap .mban_wrap ul li a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025701", "크리니크", "크리니크_중간배너", "배너_"+bnnrNm);
	});

	// 베스트셀러 상품
	$(document).on("click", ".cl_wrap .hot_product .tab_info#best_prod map area", function(){
		var prodNm = $(this).attr("alt");
		GA_Event("click_PC_영문_명품관_025701", "크리니크", "크리니크_베스트셀러", "상품_"+prodNm);
	});


	/** 
	 * 명품관 > 맥(025401)
	 */
	// 카테고리 - depth01
	$(document).on("click", "#mac_wrap .gnb > ul > li > a", function(){
		var gnbNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025401", "맥", "맥_카테고리메뉴", "카테고리메뉴_"+gnbNm);
	});
	// 카테고리 - depth02
	$(document).on("click", "#mac_wrap .gnb ul[id^='gnbsub'] > li > a", function(){
		var gnbNm = $(this).parents("ul[id^='gnbsub']").siblings("a").find("img").attr("alt").replace(/\s/g, ""),
			gnbNm1 = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025401", "맥", "맥_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);
	});
	// 카테고리 - depth03
	$(document).on("click", "#mac_wrap .gnb ul[id^='gnbsub'] li ul li a", function(){
		var gnbNm = $(this).parents("ul[id^='gnbsub']").siblings("a").find("img").attr("alt").replace(/\s/g, ""),
			gnbNm1 = $(this).parent("li").parent("ul").parent("li").contents().not($(this).parents("ul")).text().replace(/\s/g, ""),
			gnbNm2 = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025401", "맥", "맥_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1+"_"+gnbNm2);
	});

	// 메인배너 
	$(document).on("click", "#mac_wrap .home_slider .bx-wrapper li a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_025401", "맥", "맥_메인배너", "배너_"+bnnrNm);
	});

	// 상품 - 신재품, 베스트셀러, 면세전용
	$(document).on("click", "#mac_wrap .mtab #mtabdiv1 map area", function(){
		var prodNm = $(this).find("img").attr("alt");
		GA_Event("click_PC_영문_명품관_025401", "맥", "맥_신제품", "상품_"+prodNm);
	});
	$(document).on("click", "#mac_wrap .mtab #mtabdiv2 map area", function(){
		var prodNm = $(this).attr("alt");
		GA_Event("click_PC_영문_명품관_025401", "맥", "맥_베스트셀러", "상품_"+prodNm);
	});
	$(document).on("click", "#mac_wrap .mtab #mtabdiv3 map area", function(){
		var prodNm = $(this).attr("alt");
		GA_Event("click_PC_영문_명품관_025401", "맥", "맥_면세전용", "상품_"+prodNm);
	});

    /* S : 2023-07-05 추가 */
	/** 
	* 명품관 > 입생로랑(007901)
	*/
	// GNB - depth01
	$(document).on("click", "#ysl-wrap #ysl-header .gnb-list > ul > li > a", function(){
		var gnbNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_007901", "입생로랑", "입생로랑_카테고리메뉴", "카테고리메뉴_"+gnbNm);		
	});
	// GNB - depth02/depth03
	$(document).on("click", "#ysl-wrap #ysl-header .gnb-list > ul > li > .sub-menu-list > ul > li > a", function(){    
		var checkDepth = $(this).parent();
		//GNB - depth02
		if(checkDepth.hasClass('ttl')){
			var gnbNm = $(this).parents(".gnb-list > ul > li").find("a").eq(0).text().replace(/\s/g, ""),
				gnbNm1 = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_명품관_007901", "입생로랑", "입생로랑_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);			
		}
		//GNB - depth03
		else{
			var gnbNm = $(this).parents(".gnb-list > ul > li").find("a").eq(0).text().replace(/\s/g, ""),
				gnbNm1 = $(this).parents(".sub-menu-list > ul").find("li.ttl a").eq(0).text().replace(/\s/g, ""),
				gnbNm2 = $(this).text().replace(/\s/g, "");
			
			if(gnbNm1.length > 0){
				GA_Event("click_PC_영문_명품관_007901", "입생로랑", "입생로랑_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1+"_"+gnbNm2);				
			}
			else{
				GA_Event("click_PC_영문_명품관_007901", "입생로랑", "입생로랑_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm2);				
			}
		}
	});	
	// 배너 - 메인배너
	$(document).on("click", "#ysl-wrap .ysl-container .ysl-main .ysl-main-slide .slick-slide a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_007901", "입생로랑", "입생로랑_메인배너", "배너_"+bnnrNm);
	});
	// 배너 - 카테고리
	$(document).on("click", "#ysl-wrap .ysl-container .category_area ul.category li a", function(){
		var bnnrNm = $(this).parent().find("span").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_007901", "입생로랑", "입생로랑_카테고리", "카테고리_"+bnnrNm);        
	});
	// 배너 - 중간배너
	$(document).on("click", "#ysl-wrap .ysl-container .banner_area a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_007901", "입생로랑", "입생로랑_중간배너", "배너_"+bnnrNm);        
	});

	// 상품 - 베스트셀러 (선처리 완료)


	/** 
    * 명품관 > 헬레나루빈스타인(007401)
    */
    // GNB - depth01
    $(document).on("click", "#hr-wrap #header-hr .menu-list-hr > ul > li > a", function(){
        var gnbNm = $(this).text().replace(/\s/g, "");
        GA_Event("click_PC_영문_명품관_007401", "헬레나루빈스타인", "헬레나루빈스타인_카테고리메뉴", "카테고리메뉴_"+gnbNm);        
    });
    // GNB - depth02/depth03
    $(document).on("click", "#hr-wrap #header-hr .menu-list-hr > ul > li > .sub-menu-list > ul > li > a", function(){    
        var checkDepth = $(this).parent();
        // GNB - depth02
        if(checkDepth.hasClass('ttl')){
            var gnbNm = $(this).parents(".menu-list-hr > ul > li").find("a").eq(0).text().replace(/\s/g, ""),
                gnbNm1 = $(this).text().replace(/\s/g, "");
            GA_Event("click_PC_영문_명품관_007401", "헬레나루빈스타인", "헬레나루빈스타인_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);            
        }
        // GNB - depth03
        else{
            var gnbNm = $(this).parents(".menu-list-hr > ul > li").find("a").eq(0).text().replace(/\s/g, ""),
                gnbNm1 = $(this).parents(".sub-menu-list > ul").find("li.ttl a").eq(0).text().replace(/\s/g, ""),
                gnbNm2 = $(this).text().replace(/\s/g, "");       
			GA_Event("click_PC_영문_명품관_007401", "헬레나루빈스타인", "헬레나루빈스타인_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1+"_"+gnbNm2);
        }
    });
    // 배너 - 메인배너
	$(document).on("click", "#hr-wrap #main-hr .slide_box .slick-list .slick-slide .img_box a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_007401", "헬레나루빈스타인", "헬레나루빈스타인_메인배너", "배너_"+bnnrNm);        
	});
	// 배너 - 중간배너
	$(document).on("click", "#hr-wrap #main-hr .bnr_conts_wrap .type_brand a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_007401", "헬레나루빈스타인", "헬레나루빈스타인_중간배너", "배너_"+bnnrNm);        
	});
	// 배너 - 하단배너
	$(document).on("click", "#hr-wrap #main-hr .bnr_conts_wrap .type_story a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_007401", "헬레나루빈스타인", "헬레나루빈스타인_하단배너", "배너_"+bnnrNm);        
	});    
	// 상품 - 베스트셀러, 신제품 (선처리 완료)

	
	/** 
	 * 명품관 > 아베다(026201)
	 */
	// GNB - depth01
	$(document).on("click", ".avd_wrap .avd_header .avd_gnb .gnb_column h2 a", function(){		
        var gnbNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026201", "아베다", "아베다_카테고리메뉴", "카테고리메뉴_"+gnbNm);
	});
	// GNB - depth02
	$(document).on("click", ".avd_wrap .avd_header .avd_gnb .gnb_column .gnb_sub a", function(){
		var gnbNm = $(this).parents(".gnb_column").find("h2 a img").attr("alt").replace(/\s/g, ""),
			gnbNm1 = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026201", "아베다", "아베다_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);
	});	
	// 배너 - 상단배너
	$(document).on("click", ".avd_wrap .avd_header .tban_area a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026201", "아베다", "아베다_상단배너", "배너_"+bnnrNm);
	});
	// 배너 - 메인배너
	$(document).on("click", ".avd_wrap #avd_container #slides .slide a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026201", "아베다", "아베다_메인배너", "배너_"+bnnrNm);
	});
	$(document).on("click", ".avd_wrap #avd_container .full_banner a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026201", "아베다", "아베다_메인배너", "배너_"+bnnrNm);
	});
	// 배너 - 하단배너
    $(document).on("click", ".avd_wrap #avd_container .sbanner + .section a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026201", "아베다", "아베다_하단배너", "배너_"+bnnrNm);
	});
	// 배너 - 카테고리
	$(document).on("click", ".avd_wrap #avd_container .sbanner a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026201", "아베다", "아베다_카테고리", "카테고리_"+bnnrNm);
	});
	// 상품 - 베스트셀러
	$(document).on("click", ".avd_wrap #avd_container .prod_list .bx-wrapper ul li", function(){
		var prodNm = $(this).find(".name a").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026201", "아베다", "아베다_베스트셀러", "상품_"+prodNm);
	});


	/** 
	 * 명품관 > 랩시리즈(026701)
	 */
	// GNB - depth01
	$(document).on("click", ".elco_wrap .elco_header .elco_gnb .gnb_column h2 a", function(){		
        var gnbNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026701", "랩시리즈", "랩시리즈_카테고리메뉴", "카테고리메뉴_"+gnbNm);
	});
	// GNB - depth02
	$(document).on("click", ".elco_wrap .elco_header .elco_gnb .gnb_column .gnb_sub ul li a", function(){
		var gnbNm = $(this).parents(".gnb_column").find("h2 a").text().replace(/\s/g, ""),
			gnbNm1 = $(this).find("span").eq(1).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026701", "랩시리즈", "랩시리즈_카테고리메뉴", "카테고리메뉴_"+gnbNm+"_"+gnbNm1);
	});
	// 배너 - 상단배너
	$(document).on("click", ".elco_wrap .elco_header .tban_area a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026701", "랩시리즈", "랩시리즈_상단배너", "배너_"+bnnrNm);
	});
	// 배너 - 메인배너
	$(document).on("click", ".elco_wrap .elco_container #slides .slide a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026701", "랩시리즈", "랩시리즈_메인배너", "배너_"+bnnrNm);
	});
	// 배너 - 중간배너
	$(document).on("click", ".elco_wrap .elco_container .big_banner a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026701", "랩시리즈", "랩시리즈_중간배너", "배너_"+bnnrNm);
	});
	// 카테고리
	$(document).on("click", ".elco_wrap .elco_container .small_banner a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026701", "랩시리즈", "랩시리즈_카테고리", "카테고리_"+bnnrNm);
	});
	// 상품 - 베스트셀러
	$(document).on("click", ".elco_wrap .elco_container #bannerLink1 area", function(){
		var prodNm = $(this).attr('alt').replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026701", "랩시리즈", "랩시리즈_베스트셀러", "상품_"+prodNm);
	});
	// 상품 - 중간컨텐츠
	$(document).on("click", ".elco_wrap .elco_container .prod_list ul li .prod_img a", function(){
		var prodNm = $(this).parents('.prod_info').find('.name a').text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026701", "랩시리즈", "랩시리즈_중간컨텐츠_상품", "상품_"+prodNm);
	});
	$(document).on("click", ".elco_wrap .elco_container .prod_list ul li p a", function(){
		var prodNm = $(this).parents('.prod_info').find('.name a').text().replace(/\s/g, "");
		GA_Event("click_PC_영문_명품관_026701", "랩시리즈", "랩시리즈_중간컨텐츠_상품", "상품_"+prodNm);
	});
	/* E : 2023-07-05 추가 */

	/* S: 2023 개선 : 20231212 */
	
	/* S: 마이현대 > 스페셜오더 */
	$(document).on("click", ".special-order .special-order-comment-link", function(){
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더", "스페셜오더", "스페셜오더 신청내역 확인");
	});
	$(document).on("click", ".special-order .special-order-info-search .m-ico-search", function(){
		let specialSearch = $(".special-order  .special-order-info-search input").val();
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더", "스페셜오더_검색", "검색어_"+specialSearch);
	});
	$(document).on("click", ".special-order .area-hot-brand .hot-brand-emotion button", function(){
		let specialHot = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더", "스페셜오더_검색", "HOT브랜드_"+specialHot);
	});
	$(document).on("click", ".special-order .brand-category-wrap .brand-category button", function(){
		let specialCate = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더", "스페셜오더_검색", "카테고리_"+specialCate);
	});
	$(document).on("click", ".special-order .kr-en-conversion-wrap .kr-en-conversion button", function(){
		let specialConversion = $(this).text().replace(/\s/g, "");
		if (specialConversion == "가") {
			GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더", "스페셜오더_검색", "정렬_가나다순");
		} else {
			GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더", "스페셜오더_검색", "정렬_ABC순");
		}
	});
	$(document).on("click", ".special-order .kr-en-conversion-wrap .initial-sound button", function(){
		let specialInitial = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더", "스페셜오더_검색", "정렬기준_"+specialInitial);
	});

	//스페셜오더_검색결과없음 추천상품 화면 없음(2건)

	//스페셜오더 상품 신청 팝업
	$(document).on("click", ".special-order-product-application-popup .special-order-flex .change-btn", function(){
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_브랜드", "변경");
	});
	$(document).on("click", ".special-order-product-application-popup .special-order-flex .search-btn", function(){
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_상품코드", "검색");
	});
	$(document).on("click", ".special-order-product-application-popup .float_btn button", function(){
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청", "스페셜오더 신청");
	});
	$(document).on("click", ".special-order-product-application-popup .quantity-choice-wrap .num_amount .minus", function(){
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_수량조절", "빼기");
	});
	$(document).on("click", ".special-order-product-application-popup .quantity-choice-wrap .num_amount .plus", function(){
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_수량조절", "더하기");
	});
	$(document).on("click", ".list-dropdown[data-parentid='storCdGoo'] button", function(){
		if ($(".special-order-product-application-popup").length) {
			let specialBranch = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_지점선택", "지점_"+specialBranch);
		}
	});

	//스페셜오더 신청 진행
	$(document).on("click", ".area-special-order .inquiry-product-info-area .special-order-application-text:nth-child(1) button", function(){
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더_스페셜신청", "스페셜오더_스페셜신청_주문상품정보", "상품 변경");
	});
	$(document).on("click", ".list-dropdown[data-parentid='telNatiCd'] button", function(){
		if ($(".inquiry-product-info-area").length) {
			let specialNation = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더_스페셜신청", "스페셜오더_스페셜신청_주문자정보", "국적_"+specialNation);
		}
	});
	$(document).on("click", ".area-special-order .inquiry-product-info-area .special-order-application-text #myDpatInfo_btn", function(){
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더_스페셜신청", "스페셜오더_스페셜신청_출국정보입력", "출국정보 불러오기");
	});
	$(document).on("click", ".list-dropdown[data-parentid='orderDpatPlacCd'] button", function(){
		if ($(".inquiry-product-info-area").length) {
			let specialDeparture = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더_스페셜신청", "스페셜오더_스페셜신청_출국정보입력", "출국장소_"+specialDeparture);
		}
	});
	$(document).on("click", ".area-special-order .inquiry-product-info-area .order-direct-transit-area label", function(){
		let specialTransit = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더_스페셜신청", "스페셜오더_스페셜신청_출국정보입력", specialTransit);
	});
	$(document).on("click", ".list-dropdown[data-parentid='viaAreaCd'] button", function(){
		if ($(".inquiry-product-info-area").length) {
			let specialStopover = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더_스페셜신청", "스페셜오더_스페셜신청_출국정보입력", "경유지_"+specialStopover);
		}
	});
	$(document).on("click", ".area-special-order .inquiry-product-info-area .order-flight-number .search-btn", function(){
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더_스페셜신청", "스페셜오더_스페셜신청_출국정보입력", "항공사/편명_검색");
	});
	$(document).on("click", ".area-special-order .inquiry-product-info-area #saveSpord", function(){
		GA_Event("click_PC_영문_마이현대_스페셜오더", "스페셜오더_스페셜신청", "스페셜오더_스페셜신청_출국정보입력", "스페셜오더 신청");
	});
	/* E: 마이현대 > 스페셜오더 */

	/* S: 세일 */
	//01
	$(document).on("click", ".panel.specials .specials_tab .search-tab-menu li button", function(){
		var tabName = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_세일", "세일", "세일_오늘의_특가", "탭_"+tabName);
	});
	//02
	$(document).on("click", ".panel.specials .specials_tab .pn-cont.specials_inner ul li a", function(){
		var tabName = $(this).parents(".specials_tab").find(".search-tab-menu li.active button").text().replace(/\s/g, "");
		var prdbrNameCheck = $(this).parents(".display_tab_content");
		if(prdbrNameCheck.hasClass('specials_products')){
			var prdbrName = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		}
		else if(prdbrNameCheck.hasClass('specials_brands')){
			var prdbrName = $(this).find(".product__img > img").attr("alt").replace(/\s/g, "");
		}
		GA_Event("click_PC_영문_세일", "세일", "세일_오늘의_특가_탭_"+tabName, tabName+"_"+prdbrName);
	});
	//03,04
	$(document).on("click", ".panel.hshares .pn-cont.specials_inner .swiper-slide a", function(){
		var bannerCheck = $(this).parents(".swiper-slide");
		if(bannerCheck.hasClass('product-more-link')){
			var banName = $(this).find("p").text().replace(/\s/g, "");
			GA_Event("click_PC_영문_세일", "세일", "세일_공구특가_뭉치면_싸진다!", "배너_"+banName);
		}
		else{
			var prdName = $(this).find(".product__brand-info").text().replace(/\s/g, "");
			GA_Event("click_PC_영문_세일", "세일", "세일_공구특가_뭉치면_싸진다!", "상품_"+prdName);
		}
	});
	//05
	$(document).on("click", ".panel.browse .browse_category .search-round-data ul li button", function(){
		var discRatio = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_세일", "세일", "세일_세일상품_둘러보기", "할인율_"+discRatio);
	});
	//06
	$(document).on("click", ".panel.browse .product-list-content-wrap .goosMoreArea ul.list-product li a", function(){
		var prdbrName = $(this).find(".pro_i p.goosNm").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_세일", "세일", "세일_세일상품_둘러보기", "상품_"+prdbrName);
	});
	//07
	$(document).on("click", ".panel.browse .product-list-content-wrap .goosMoreArea ul.list-product li a .btn-cart", function(){
		GA_Event("click_PC_영문_세일", "세일", "세일_세일상품_둘러보기", "장바구니_담기");
	});
	
	//2024-08-12 첫구매딜 추가
	$(document).on("click", ".panel.firstdeal .content__inner .sale__first-deal .product__item a", function(){
		var prdName = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_세일", "세일", "세일_첫구매딜", "상품_"+prdName);
	});
	/* E: 세일 */

	/* S: 베스트 */
	$(document).on("click", ".area-display-bests .bests_tab > ul li.display_tab_item button", function(){
		var tabNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_베스트", "베스트", "베스트_탭", "탭_"+tabNm);
	});
	$(document).on("click", ".area-display-bests .search-round-data__bests-ico ul li button", function(){
		var cateNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_베스트", "베스트", "베스트_탭_베스트상품", "카테고리_"+cateNm);
	});
	$(document).on("click", ".area-display-bests .bests_tab .bests_goods .bests_itemlist .list-product__searchlist li a", function(){
		var branNm = $(this).find(".product__brand").text().replace(/\s/g, ""),
			goosNm = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_베스트", "베스트", "베스트_탭_베스트상품", "상품_"+branNm+"_"+goosNm);
	});
	$(document).on("click", ".area-display-bests .bests_tab .bests_goods .bests_itemlist .list-product__searchlist li .btn-cart", function(){
		var tabNm = $(".area-display-bests .bests_tab > ul li.active").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_베스트", "베스트", "베스트_탭_"+tabNm, "장바구니담기");
	});
	$(document).on("click", ".area-display-bests .bests_tab .bests_brand .bests_brand_item .bests_brand_thumb a", function(){
		var branNm = $(this).find(".bests_brand_tit").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_베스트", "베스트", "베스트_탭_베스트브랜드", "브랜드_"+branNm);
	});
	$(document).on("click", ".area-display-bests .bests_tab .bests_brand .bests_brand_item .best_innerslide .product__item a", function(){
		var goosNm = $(this).find(".product__brand-info").text().replace(/\s/g, '');
		GA_Event("click_PC_영문_베스트", "베스트", "베스트_탭_베스트브랜드", "상품_"+goosNm);
	});//베스트브랜드 1,2위만 사용
	$(document).on("click", ".area-display-bests .bests_tab .bests_brand .bests_brand_item .bests_brand_item--btmbox .product__item a", function(){
		var goosNm = $(this).find("img").attr("alt").replace(/\s/g, '');
		GA_Event("click_PC_영문_베스트", "베스트", "베스트_탭_베스트브랜드", "상품_"+goosNm);
	});//베스트브랜드 3위 이상
	/* S : 2025-05-30 국중영 PC/MO 베스트 > 재입고 알림 / 큐레이션 관련 GA4 추가 */
	$(document).on("click", ".area-display-bests .bests_tab .bests_goods .bests_itemlist .list-product__searchlist li .soldout-banner", function(){		
		GA_Event("click_PC_영문_베스트", "베스트", "베스트_탭_재입고알림", "더보기");
	});
	/* E : 2025-05-30 국중영 PC/MO 베스트 > 재입고 알림 / 큐레이션 관련 GA4 추가 */
	/* E: 베스트 */
	
	/* S: 혜택 */
	$(document).on("click", ".area-display-benefits .box-benefits .benefits-topbanner-swiper .banner_item a", function(){
		let benefitBanner = $(this).find(".banner_tit").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_혜택", "혜택", "혜택_배너", "배너_"+benefitBanner);

		if (benefitBanner == "") {
			let benefitAlt = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_PC_영문_혜택", "혜택", "혜택_배너", "배너_"+benefitAlt);
		}
	});
	$(document).on("click", ".area-display-benefits .benefits_tab li[name='fstTab'] button", function(){
		let benefiTab = $(this).parents("li.active").find("button span").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_혜택", "혜택", "혜택_탭", "탭_"+benefiTab);
	});
	$(document).on("click", ".area-display-benefits .benefits_online .display_tab_sub li button", function(){
		let benefiTab = $(".area-display-benefits .benefits_tab li[name='fstTab'].active").text().replace(/\s/g, "");
		let benefitCate = $(this).parents("li.active").find("button span").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_혜택", "혜택", "혜택_탭_"+benefiTab, "컨텐츠탭_"+benefitCate);
	});
	$(document).on("click", ".area-display-benefits #trdCtgAra button", function(){
		let benefitBranch = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_혜택", "혜택", "오프라인혜택_컨텐츠탭_지점", "오프라인지점_"+benefitBranch);
	});
	$(document).on("click", ".area-display-benefits .display_search_top .m-ico-search", function(){
		let benefiTab = $(".area-display-benefits .benefits_tab li[name='fstTab'].active").text().replace(/\s/g, "");
		let benefitSearch = $(".area-display-benefits .display_search_top input[type='text']").val().replace(/\s/g, "");
		GA_Event("click_PC_영문_혜택", "혜택", "혜택_탭_"+benefiTab+"_검색", "검색어_"+benefitSearch);
	});
	$(document).on("click", ".area-display-benefits ul[name='evntListResultDiv'] li a", function(){
		let benefiTab = $(".area-display-benefits .benefits_tab li[name='fstTab'].active").text().replace(/\s/g, "");
		let benefitName = $(this).find(".tit").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_혜택", "혜택", "혜택_탭_"+benefiTab+"기획전", "기획전_"+benefitName);
	});
	$(document).on("click", ".area-display-benefits .btn_like", function(){
		let benefiTab = $(".area-display-benefits .benefits_tab li[name='fstTab'].active").text().replace(/\s/g, "");
		if ($(this).hasClass("on")) {
			GA_Event("click_PC_영문_혜택", "혜택", "혜택_탭_"+benefiTab+"_기획전", "관심이벤트등록");
		} else {
			GA_Event("click_PC_영문_혜택", "혜택", "혜택_탭_"+benefiTab+"_기획전", "관심이벤트삭제");
		}
	});
	/* E: 혜택 */


	/* S: 상품상세 */
	//상단
	$(document).on("click", ".area-product-detail .pd_descript .desc_MDcomment", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상단", "상단_구매혜택", "구매혜택_"+btText);
	});
	$(document).on("click", ".area-product-detail .pd_descript .desc_goods .goods_brand", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상단", "상단_브랜드상세", "브랜드_"+btText);
	});
	$(document).on("click", ".area-product-detail .pd_descript .desc_goods .btn_like", function(){
		if ($(this).hasClass("on")) {
			GA_Event("click_PC_영문_상품상세", "상단", "상단_좋아요", "관심상품등록");
		} else {
			GA_Event("click_PC_영문_상품상세", "상단", "상단_좋아요", "관심상품삭제");
		}
	});
	$(document).on("click", ".area-product-detail .pd_descript .desc_goods .wrap-tooltip__content.type-share .cont a", function(){
		let btText = $(this).find('img').attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상단", "상단_공유하기", "공유하기_"+btText);
	});
	$(document).on("click", ".area-product-detail .pd_descript .desc_goods .desc_review .review-count__num", function(){
		GA_Event("click_PC_영문_상품상세", "상단", "상단_리뷰 보기", "리뷰 보기");
	});
	$(document).on("click", ".area-product-detail .pd_descript .desc_priceinfo .btn_area.save_point button", function(){
		let btText = $(this).find('img').attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상단", "상단_쿠폰/적립금", btText);
	});

	//상세탭
	$(document).on("click", ".area-product-detail .pd_descript .desc_priceinfo .btn_area.save_point button", function(){
		let btText = $(this).find('img').attr("alt").replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_혜택", "상세탭_혜택", btText);
	});
	$(document).on("click", ".area-product-detail .pd_benefitsinfo .wrap-tooltip .btn-tooltip", function(){
		let btText = $(this).parent(".wrap-tooltip").prev("span").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_혜택", "상세탭_혜택", btText+"_안내");
	});
	$(document).on("click", ".area-product-detail .pd_benefitsinfo dd a", function(){
		GA_Event("click_PC_영문_상품상세", "상세탭_혜택", "상세탭_혜택", "무이자할부/카드사포인트 안내");
	});

	//상품옵션선택
	$(document).on("click", ".area-product-detail .pd-head-right .opt_basic .opt_basic_list li label", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상품옵션선택", "상품옵션선택_탭타입", "탭_"+btText);
	});

	$(document).on("click", ".area-product-detail .pd-head-right .opt_chip .select_items button", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상품옵션선택", "상품옵션선택_칩타입", btText);
	});
	$(document).on("click", ".area-product-detail .opt_chip .option-change__num .minus", function(){
		GA_Event("click_PC_영문_상품상세", "상품옵션선택", "일반_상품옵션선택_곗수", "빼기");
		if ($(".area-product-detail .pd_hShare").length) {
			GA_Event("click_PC_영문_상품상세", "상품옵션선택", "공구특가_상품옵션선택_곗수", "빼기");
		}
	});
	$(document).on("click", ".area-product-detail .opt_chip .option-change__num .plus", function(){
		GA_Event("click_PC_영문_상품상세", "상품옵션선택", "일반_상품옵션선택_곗수", "더하기");
		if ($(".area-product-detail .pd_hShare").length) {
			GA_Event("click_PC_영문_상품상세", "상품옵션선택", "공구특가_상품옵션선택_곗수", "더하기");
		}
	});

	//상단 - 최저가 엿보기 / 장바구니 / 바로구매 등
	$(document).on("click", ".area-product-detail .pd_product_total .btn_area .btn-square", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상품옵션선택", "상단_일반", btText);
		if ($(".area-product-detail .pd_hShare").length) {
			GA_Event("click_PC_영문_상품상세", "상품옵션선택", "상단_공구특가", btText);
		}
	});

	//세트상품
	$(document).on("click", ".area-product-detail .pd_set .pd-set-swiper .product__item a", function(){
		let btText = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_혜택", "상세탭_혜택_세트상품", "상품_"+btText);
	});
	$(document).on("click", ".area-product-detail .pd_set .pd-set-swiper .product__option .minus", function(){
		GA_Event("click_PC_영문_상품상세", "상세탭_혜택", "상세탭_혜택_세트상품", "상품빼기");
	});
	$(document).on("click", ".area-product-detail .pd_set .pd-set-swiper .product__option .plus", function(){
		GA_Event("click_PC_영문_상품상세", "상세탭_혜택", "상세탭_혜택_세트상품", "상품더하기");
	});
	$(document).on("click", ".area-product-detail .pd_set .pd-set-swiper .product__option .btn-square", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_혜택", "상세탭_혜택_세트상품", btText);
	});
	//세트상품 팝업
	$(document).on("click", "#setEvtLayer .set-product-area .select-brand-wrap .select-brand label", function(){
		let btText = $(this).find(".sb-name").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "세트상품선택", "세트상품선택_브랜드선택", "브랜드_"+btText);
	});
	$(document).on("click", "#setEvtLayer .set-product-area .select-product-wrap .title-flex .search-form button", function(){
		let btInput = $(this).parents(".search-form").find("input[name='keyword']").val().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "세트상품선택", "세트상품선택_상품검색", "검색어_"+btInput);
	});
	$(document).on("click", "#setEvtLayer .set-product-area .select-product-wrap .select-product a", function(){
		let btText = $(this).find(".pd-main-content']").val().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "세트상품선택", "세트상품선택_상품선택", "상품상세보기_"+btText);
	});
	$(document).on("click", "#setEvtLayer .set-product-area .select-product-wrap .select-product .sel-box label", function(){
		let btText = $(this).parents("li").find(".pd-main-content']").val().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "세트상품선택", "세트상품선택_상품선택", "세트상품담기_"+btText);
	});
	$(document).on("click", "#setEvtLayer .payment-cart-wrap .cart-product-list .num_amount .minus", function(){
		GA_Event("click_PC_영문_상품상세", "상세탭_혜택", "상세탭_혜택_세트상품", "상품빼기");
	});
	$(document).on("click", "#setEvtLayer .payment-cart-wrap .cart-product-list .num_amount .plus", function(){
		GA_Event("click_PC_영문_상품상세", "상세탭_혜택", "상세탭_혜택_세트상품", "상품더하기");
	});
	$(document).on("click", "#setEvtLayer .payment-cart-wrap .cart-product-list .cart-in-btn", function(){
		GA_Event("click_PC_영문_상품상세", "상세탭_혜택", "상세탭_혜택_세트상품", "장바구니담기");
	});
	//세트구성보기
	$(document).on("click", ".set-product-view-float-layer .option-change__num input[value='-']", function(){
		GA_Event("click_PC_영문_상품상세", "세트구성보기", "세트구성보기", "상품빼기");
	});
	$(document).on("click", ".set-product-view-float-layer .option-change__num input[value='+']", function(){
		GA_Event("click_PC_영문_상품상세", "세트구성보기", "세트구성보기", "상품더하기");
	});
	$(document).on("click", ".set-product-view-float-layer .float_btn .btn-square", function(){
		GA_Event("click_PC_영문_상품상세", "세트구성보기", "세트구성보기", "장바구니 담기");
	});

	//상단탭
	$(document).on("click", ".area-product-detail .pd-body-conent .productdetail_tab ul li button", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상단", "상단_상세탭", "상세탭_"+btText);
	});
	$(document).on("click", ".area-product-detail .pd-body-conent .pd_descript_contents .brandzone .btn_area button", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_상세", "상세탭_상세", btText);
	});
	$(document).on("click", ".area-product-detail .pd-body-conent .pd_descript_contents .btn_more_box .btn_prodmore", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_상세", "상세탭_상품정보", btText); //상품상세 더보기
	});
	$(document).on("click", ".area-product-detail .pd_noti_contents a", function(){
		let btText = $(this).find(".tit").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_상세", "상세탭_상세_유의사항", btText);
	});

	//추천
	$(document).on("click", ".area-product-detail .pd_recommended .pd-recommended-swiper .product__item a", function(){
		let btText = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_상세", "상세탭_이 상품과 함께 구매해보세요!", "상품_"+btText);
	});
	$(document).on("click", ".area-product-detail .pd_recommended .pd-recommended-swiper .product__item .btn-cart", function(){
		GA_Event("click_PC_영문_상품상세", "상세탭_상세", "상세탭_이 상품과 함께 구매해보세요!", "장바구니 담기");
	});
	$(document).on("click", ".area-product-detail .pd_bestbrand .tit a", function(){
		let btTit = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_상세", "상세탭_상세", "상세탭_상세_"+btTit, "브랜드샵 바로가기");
	});
	$(document).on("click", ".area-product-detail .pd_bestbrand .pd-bestbrand-swiper .product__item a", function(){
		let btTit = $(this).parents(".pd_bestbrand").find(".tit").text().replace(/\s/g, "");
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_상세", "상세탭_상세_"+btTit, "상품_"+btText);
	});
	$(document).on("click", ".area-product-detail .pd_bestbrand .pd-bestbrand-swiper .product__item .btn-cart", function(){
		let btTit = $(this).parents(".pd_bestbrand").find(".tit").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_상세", "상세탭_상세_"+btTit, "장바구니 담기");
	});
	$(document).on("click", ".area-product-detail .pd_ititems .pd-ititems-swiper .product__item a", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_상세", "상세탭_상세_제안하는 잇템!", "상품_"+btText);
	});
	$(document).on("click", ".area-product-detail .pd_ititems .pd-ititems-swiper .product__item .btn-cart", function(){
		GA_Event("click_PC_영문_상품상세", "상세탭_상세", "상세탭_상세_제안하는 잇템!", "장바구니 담기");
	});
	$(document).on("click", "#addGoosGrvwsPop", function(){
		GA_Event("click_PC_영문_상품상세", "상세탭_상세", "상세탭_상세_제안하는 잇템!", "관심상품 등록");
	});
	
	//리뷰
	$(document).on("click", ".area-product-detail .pd_pointreview .pd_head a, .area-product-detail .pd_pointreview .product-no-review a", function(){
		GA_Event("click_PC_영문_상품상세", "상세탭_리뷰", "상세탭_리뷰", "리뷰 등록");
	});
	$(document).on("click", ".area-product-detail .pd_pointreview .pd_body .total-review-chart .chart-area .bar", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_리뷰", "상세탭_리뷰_평점비율", "평점비율_"+btText);
	});
	$(document).on("click", ".area-product-detail .pd_filterview ul.filter label", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_리뷰", "상세탭_리뷰_정렬기준", "정렬기준_"+btText);
	});
	$(document).on("click", ".area-product-detail .pd_filterview .photo-review .btn-photo-review, .area-product-detail .pd_reviewlist .more", function(){
		GA_Event("click_PC_영문_상품상세", "상세탭_리뷰", "상세탭_리뷰", "포토리뷰");
	});
	$(document).on("click", ".area-product-detail .pd_filterview .star-select-box-wrap .star-select-box-ul li", function(){
		let btText = $(this).find(".star").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "상세탭_리뷰", "상세탭_리뷰_별점기준", "별점기준_"+btText)+"점";
	});
	$(document).on("click", ".area-product-detail .pd_filterview .list-review-detail .review-detail-cont", function(){
		GA_Event("click_PC_영문_상품상세", "상세탭_리뷰", "상세탭_리뷰", "리뷰보기");
	});
	$(document).on("click", ".area-product-detail .pd_filterview .btn_more_box button", function(){
		GA_Event("click_PC_영문_상품상세", "상세탭_리뷰", "상세탭_리뷰", "더보기");
	});
	$(document).on("click", "#listAllPohtoGrvwsPop .download-coupon .photo-review-img a", function(){
		GA_Event("click_PC_영문_상품상세", "포토리뷰", "포토리뷰_상세", "포토리뷰_상세보기");//리뷰제목은 가져올 수 없음
	});
	$(document).on("click", "#dtlGrvwsPop .photo-review-detail-popup .photo-review-more-all", function(){
		GA_Event("click_PC_영문_상품상세", "포토리뷰", "포토리뷰_상세", "포토리뷰_전체보기");
	});
	//리뷰 팝업
	$(document).on("click", "#addGoosGrvwsPop .review-regist-inspection .rating-static .star_grade button", function(){
		let btText = $("#addGoosGrvwsPop .review-regist-inspection .rating-static .star_grade .on").length;
		GA_Event("click_PC_영문_상품상세", "리뷰등록", "리뷰등록_평점", "평점_"+btText+"점");
	});
	$(document).on("click", "#addGoosGrvwsPop .attach-img-box .attach-img label", function(){
		GA_Event("click_PC_영문_상품상세", "리뷰등록", "리뷰등록_사진첨부", "사진추가");
	});
	$(document).on("click", "#addGoosGrvwsPop .attach-img-box .attach-img button", function(){
		GA_Event("click_PC_영문_상품상세", "리뷰등록", "리뷰등록_사진첨부", "사진삭제");
	});
	$(document).on("click", "#addGoosGrvwsPop .wrap-btn button", function(){
		GA_Event("click_PC_영문_상품상세", "리뷰등록", "리뷰등록", "등록");
	});
	//쿠폰다운로드
	$(document).on("click", ".wrap-download-coupon.wrap-coupon .download-coupon .btn-download-all", function(){
		GA_Event("click_PC_영문_상품상세", "쿠폰", "쿠폰_다운로드", "쿠폰 한번에 받기");
	});
	$(document).on("click", ".wrap-download-coupon.wrap-coupon .download-coupon .list-coupon a", function(){
		let btText = $(this).find(".coupon__tit").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "쿠폰", "쿠폰_다운로드", "쿠폰_"+btText);
	});
	//적립금다운로드
	$(document).on("click", ".wrap-download-coupon.wrap-reserve .download-coupon button[onclick='issueSvmts()']", function(){
		GA_Event("click_PC_영문_상품상세", "적립금", "적립금_다운로드", "적립금 한번에 받기");
	});
	$(document).on("click", ".wrap-download-coupon.wrap-reserve .download-coupon .list-coupon a", function(){
		let btText = $(this).find(".coupon__tit").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "적립금", "적립금_다운로드", "적립금_"+btText);
	});
	//브랜드 혜택 알림 설정
	if ($(".container").find(".brand-noti-box-float-layer").length) {
		$(document).on("click", ".wrap-calendar .wrap-calendar-day button", function(){
			let departuredate = $(".brand-noti-box-float-layer .departure-date .option-change .choice-date-single input").val().replace(/\s/g, "");
			GA_Event("click_PC_영문_상품상세", "브랜드 혜택 알림 설정", "브랜드 혜택 알림 설정", "출국일"+departuredate);
		});
		$(document).on("click", "ul[data-parentid='telNatiCd'] li button", function(){
			let btText = $(this).text().replace(/\s/g, "");
			GA_Event("click_PC_영문_상품상세", "브랜드 혜택 알림 설정", "브랜드 혜택 알림 설정", btText);
		});
	}
	$(document).on("click", ".brand-noti .wrap-btn .brand-noti-btn", function(){
		let btText = $(this).find(".coupon__tit").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "브랜드 혜택 알림 설정", "브랜드 혜택 알림 설정", btText);
	});
	//사은품
	$(document).on("click", ".gift-more-box-float-layer .gift-more-area li a", function(){
		let btText = $(this).find(".gift-name").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품상세", "사은품", "사은품", btText);
	});
	/* E: 상품상세 */

	/* S: 상품유닛, 상품리스트*/
	$(document).on("click", ".area-product-list .list-product .product__item a", function(){
		let btText = $(this).find(".tx_ex.goosNm").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품유닛", "상품유닛", "상품유닛_상품선택", btText);
	});
	$(document).on("click", ".area-product-list .list-product .product__item a .btn-cart", function(){
		GA_Event("click_PC_영문_상품유닛", "상품유닛", "상품유닛_상품선택", "장바구니 담기");
	});
	$(document).on("click", ".area-product-list .product-list-header .product-category-menu-wrap .product-category-menu li:nth-child(1) .product-category--menu a", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품리스트", "상품리스트", "상품리스트_카테고리", "카테고리_"+btText);
	});
	$(document).on("click", ".area-product-list .product-list-header .product-category-menu-wrap .product-category-menu li:nth-child(2) .product-category--menu a", function(){
		let cateDepth1 = $(".area-product-list .product-list-header .product-category-menu-wrap .product-category-menu > li:nth-child(1) > a").text().replace(/\s/g, "");
		let cateDepth2 = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_상품리스트", "상품리스트", "상품리스트_카테고리", "카테고리_"+cateDepth1+cateDepth2);
	});
	
	//상품필터 공통으로 잡음
	if ($("#wrap").find(".filter-info").length) {

		var minPriceFilter = $('.product-list-content-wrap .filter-info .price-range-data #priceDataMin').val(); //필터 가격 최소금액
		var maxPriceFilter = $('.product-list-content-wrap .filter-info .price-range-data #priceDataMax').val(); //필터 가격 최대금액


		$(document).on("click", ".product-saerch-list-top .toggle-switch-wrap .toggle-switch input", function(){
			if($(this).is(":checked")){
				GA_Event("국문_상품리스트", "상품리스트", "상품리스트", "품절상품보지않기");
			}
			else{
				GA_Event("국문_상품리스트", "상품리스트", "상품리스트", "품절상품보기");
			}
		});
		$(document).on("click", ".wrap-list-dropdown .list-dropdown[data-parentid='goodsListOrder'] li button", function(){
			var optNm = $(this).text().replace(/\s/g, "");
			GA_Event("국문_상품리스트", "상품리스트", "상품리스트_정렬기준", "정렬기준_"+optNm);
		});

		$(document).on("click", ".product-list-content-wrap .filter-info input[name='benefitFilter']", function () {
			var filterName = $(this).val().replace(/\s/g, '');
			GA_Event("click_PC_영문_상품리스트", "상품리스트", "상품리스트_혜택필터", filterName);
		});
		$(document).on("click", ".product-list-content-wrap .filter-info input[name='shopFilter']", function () {
			var filterName = $(this).val().replace(/\s/g, '');
			GA_Event("click_PC_영문_상품리스트", "상품리스트", "상품리스트_상품유형필터", filterName);
		});
		
		$(document).on("click", ".product-list-content-wrap .filter-info #filterCtgAcd input[type='checkbox']", function () {
			var filterName = $(this).val().replace(/\s/g, ''),
				filterTit = $(this).parents(".accordion__cont").find(".category-one-depth-name").text().replace(/\s/g, '');
			GA_Event("click_PC_영문_상품리스트", "상품리스트", "상품리스트_카테고리필터", filterTit+"_"+filterName);
		});
		$(document).on("click", ".filter-info .filter-initial-sound li button, .filter-layer .initial-sound #kr-initial li button", function () {
			var filterName = $(this).text().replace(/\s/g, '');
			GA_Event("click_PC_영문_상품리스트", "상품리스트", "상품리스트_카테고리필터", "정렬기준_"+filterName);
		});

		$(document).on("click", ".filter-info .filter-box-check[name='brnListArea'] label, .filter-layer .initial-sound-data .filter-box-check label", function () {
			var filterName = $(this).text().replace(/\s/g, '');
			GA_Event("click_PC_영문_상품리스트", "상품리스트", "상품리스트_브랜드필터", "브랜드_"+filterName);
		});
		//필터 브랜드 팝업 초기화, 확인버튼
		$(document).on("click", ".filter-layer .float_btn button", function () {
			var btName = $(this).text().replace(/\s/g, '');
			GA_Event("click_PC_영문_상품리스트", "상품리스트", "상품리스트_브랜드필터", btName);
		});

		
		$(document).on("click", ".product-list-content-wrap .filter-info .filter-box-footer .refresh-btn", function () {
			GA_Event("click_PC_영문_상품리스트", "상품리스트", "상품리스트_필터", "초기화");
		});
		
		$(document).on("click", ".product-list-content-wrap .filter-info .filter-box-footer .filter-apply-btn", function () {
			GA_Event("click_PC_영문_상품리스트", "상품리스트", "상품리스트_필터", "필터적용");
			if (!$('.product-list-content-wrap .filter-info .price-range-data #priceDataMin') == minPriceFilter || (!$('.product-list-content-wrap .filter-info .price-range-data #priceDataMax') == maxPriceFilter)) {
				var minPriceNew = $(".product-list-content-wrap .filter-info .price-range-data #priceDataMin").val();
				var maxPriceNew = $(".product-list-content-wrap .filter-info .price-range-data #priceDataMax").val();
				GA_Event("click_PC_영문_상품리스트", "상품리스트", "상품리스트_가격필터", "가격_"+minPriceNew+"_"+maxPriceNew);
			}
		});
	}

	/* S: 큐레이션 */
	/* 메인 큐레이션 배너 */
	$(document).on("click", ".area-personal-link a", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_큐레이션", "띠배너", "띠배너", "배너"+btText);
	});

	// 로그인 전 - 로그인하고 큐레이션확인
	$(document).on("click", ".area-personal .personal-link .personal-login__btn", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_큐레이션", "큐레이션메인", "여행정보_로그인전", btText);
	});
	// 로그인 전 - 회원가입
	$(document).on("click", ".area-personal .personal-link a", function(){
		let btText = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_큐레이션", "큐레이션메인", "여행정보_로그인전", btText);
	});
	// 로그인 후 
	$(document).on("click", ".area-personal .personal-info .personal-info__pickup button", function(){
		GA_Event("click_PC_영문_큐레이션", "여행정보", "여행정보", "상품픽업위치확인");
	});

	$(document).on("click", ".area-personal .personal-info .my-passport__group .wrap-btn li:nth-child(1)", function(){
		GA_Event("click_PC_영문_큐레이션", "여행정보", "여행정보수정", "여권정보등록");
	});
	$(document).on("click", ".area-personal .personal-info .my-passport__group .wrap-btn li:nth-child(2)", function(){
		GA_Event("click_PC_영문_큐레이션", "여행정보", "여행정보수정", "출국정보등록");
	});

	$(document).on("click", ".area-personal .personal-info .my-passport__detail .btn-edit", function(){
		GA_Event("click_PC_영문_큐레이션", "여행정보", "여행정보수정", "여권정보수정");
	});
	$(document).on("click", ".area-personal .personal-info .my-departure__wrap .btn-edit", function(){
		GA_Event("click_PC_영문_큐레이션", "여행정보", "여행정보수정", "출국정보수정");
	});
	$(document).on("click", ".area-personal .ps_benefits .benefits-slider .swiper-slide .product__item a", function(){
		var bnnrNm = $(this).find(".product__brand").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_큐레이션", "여행정보", "혜택바로보기", bnnrNm);
	});

	// 큐레이션 만들기 전
	$(document).on("click", ".area-personal .personal-taste .taste-tab li button", function(){
		var tabNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션취향_탭", "탭_" + tabNm);
	});
	$(document).on("click", ".area-personal .personal-taste .taste-list .taste-list__item label", function(){
		var tabNm = $(".area-personal .personal-taste .taste-tab li.is-active button").text().replace(/\s/g, ""),
			catNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션취향_"+tabNm, "카테고리_" + catNm);
	});
	$(document).on("click", ".area-personal .personal-taste .taste-list__btn .btn-curation", function(){
		var tabNm = $(".area-personal .personal-taste .taste-tab li.is-active button").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션취향_"+tabNm, "쇼핑 큐레이션 만들기");
	});
	$(document).on("click", ".area-personal .personal-taste .taste-list__btn .btn-curation-recent", function(){
		var tabNm = $(".area-personal .personal-taste .taste-tab li.is-active button").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션취향_"+tabNm, "최근 큐레이션 다시보기");
	});

	// 큐레이션 만들기 후
	$(document).on("click", ".area-personal .resut-content .list-result-keyword .result-modify button", function(){
		GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션결과", "수정");
	});
	$(document).on("click", ".area-personal .resut-content .result-refresh .btn-curation-recent", function(){
		GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션결과", "큐레이션컨텐츠새로고침");
	});
	
	// 큐레이션 결과 영역
	// 탭_혜택 : 이달의혜택, 회원전용혜택, 제휴혜택, 결제혜택, 구매사은, 타임세일
	$(document).on("click", ".area-personal .resut-content .result-product .result-product__inner .list-product__searchlist li a", function(){
		var titNm = $(this).parents(".result-product__inner").find(".result-product__tit").text().replace(/\s/g, ""),
			mainTxt = $(this).find("p").text().replace(/\s/g, ""),
			subTxt = $(this).find("strong").text().replace(/\s/g, ""),
			hashTxt = $(this).parents(".result-product__inner").find(".result-product__banner").text().replace(/\s/g, "").
			prodTxt = $(this).find(".tx_ex").text().replace(/\s/g, "");
		if ($(this).find(".pro_i").length) {
			GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션결과_"+titNm, "결과_" + prodTxt);
		} else if ($(this).find("strong").length) {
			GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션결과_"+titNm, "결과_" + mainTxt + subTxt);
		} else if ($(this).parents(".result-product__inner").find(".result-product__banner").length) {
			GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션결과_"+hashTxt, "결과_" + mainTxt);
		} else {
			GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션결과_"+titNm, "결과_" + mainTxt); // 그 외, 모두
		}
	});

	// 탭_혜택 : 예비신혼부부전용, 딱하루세일 ----> 화면 확인 불가

	// 탭_혜택 : 지금 HOT한 #캐치태그
	// $(document).on("click", ".area-personal .ps_quration.type-result .qr_result > .result_prod > a.prod_brand", function(){
	// 	var tagNm = $(this).find("span").text().replace(/\s/g, "");
	// 	GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션결과_지금HOT한#캐치태그", "띠배너_"+tagNm);
	// });
	// $(document).on("click", ".area-personal .ps_quration.type-result .qr_result > .result_prod.result_prod_brand_hash .list-product .product__item a", function(){
	// 	var tagNm = $(this).parents(".result_prod").prev(".result_prod").find("span").text().replace(/\s/g, ""),
	// 		mainTxt = $(this).parents(".product__item").find(".product__brand").text().replace(/\s/g, ""),
	// 		subTxt = $(this).parents(".product__item").find(".product__brand-info").not($(".info_peri")).text().replace(/\s/g, "");
	// 	GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션결과_지금HOT한#캐치태그_"+tagNm, mainTxt+"_"+subTxt);
	// });
	// $(document).on("click", ".area-personal .ps_quration.type-result .qr_result > .result_prod.result_prod_brand_hash .list-product .type-coupon button", function(){
	// 	var tagNm = $(this).parents(".result_prod").prev(".result_prod").find("span").text().replace(/\s/g, ""),
	// 		mainTxt = $(this).parents(".product__item").find(".product__brand").text().replace(/\s/g, ""),
	// 		subTxt = $(this).parents(".product__item").find(".product__brand-info").not($(".info_peri")).text().replace(/\s/g, "");
	// 	GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션결과_지금HOT한#캐치태그_"+tagNm, "혜택_"+mainTxt+"_"+subTxt);
	// });

	// 탭_발견 : 지금제일저렴한, 지금많이구매한, 지금많이찾아본 ----> 화면 확인 불가

	// 탭_발견 : 명품브랜드, 쿠폰사용가능
	// 탭_탐색 : Cosmetic&Perfume, Fashion&Accessory, Liquor&Tobacco, Luxury Fashion, Souvenir&Foods, Watch&Jewelry
	// $(document).on("click", ".area-personal .resut-content .result-product .result-product__inner .result_prod_area .result-product__banner.type-logo", function(){
	// 	var titNm = $(this).parents(".result-product__inner").find(".result-product__tit").text().replace(/\s/g, ""),
	// 		branNm = $(this).find("span").text().replace(/\s/g, "");
	// 	GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션결과_"+titNm, "브랜드_"+branNm);
	// });
	// $(document).on("click", ".area-personal .resut-content .result-product .result-product__inner .result_prod_area .result-product__banner.type-logo", function(){
	// 	var titNm = $(this).parents(".result-product__inner").find(".result-product__tit").text().replace(/\s/g, ""),
	// 		branNm = $(this).parents(".result_prod_list").prev(".result_prod").find("span").text().replace(/\s/g, ""),
	// 		goosNm = $(this).find(".product__brand-info").text().replace(/\s/g, "");
	// 	GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션결과_"+titNm, "상품_"+branNm+"_"+goosNm);
	// });

	// 탭_발견 : 취향저격 그 상품, 최근본 상품
	// 탭_탐색 : 새로운상품
	// $(document).on("click", ".area-personal .ps_quration.type-result .qr_result > .result_prod .list-product.list-product__searchlist .goosList.item", function(){
	// 	var titNm = $(this).parents(".result_prod").prev(".tit").find("span").text().replace(/\s/g, ""),
	// 		branNm = $(this).attr("data-brannm").replace(/\s/g, ""),
	// 		goosNm = $(this).attr("data-goosnm").replace(/\s/g, "");
	// 		GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션결과_"+titNm, "상품_"+branNm+"_"+goosNm);
	// });
	// $(document).on("click", ".area-personal .ps_quration.type-result .qr_result > .result_prod .list-product.list-product__searchlist .goosList.item .cart a", function(){
	// 	var titNm = $(this).parents(".result_prod").prev(".tit").find("span").text().replace(/\s/g, "");
	// 		GA_Event("click_PC_영문_큐레이션", "여행정보", "큐레이션결과_"+titNm, "장바구니담기");
	// });
	
	/* S : 2025-05-30 국중영 PC/MO 베스트 > 재입고 알림 / 큐레이션 관련 GA4 추가 */
	$(document).on("click", ".area-gnb .wrap-gnb-logo .default_menu > ul > li.item_curation", function(){
		GA_Event("click_PC_영문_공통", "큐레이션", "큐레이션", "더보기");		
	});
	$(document).on("click", ".float-benefit .float-hidden-menu .item .swiper-slide a", function(){
		GA_Event("click_PC_영문_큐레이션", "여행정보", "플로팅배너", "더보기");		
	});
	/* E : 2025-05-30 국중영 PC/MO 베스트 > 재입고 알림 / 큐레이션 관련 GA4 추가 */
	/* E: 큐레이션 */

	/* S: 검색 */
	/*$(document).on("click", ".area-gnb .wrap-gnb-search .btn_search", function () {
		if ($(this).parents(".select_search").hasClass("tag") == true) {
			var srchHash = $(this).parents(".searchfield").find("input[id='hashSearchTerm']").val().replace(/\s/g, "");
			GA_Event("click_PC_영문_검색", "검색전", "검색전_해시태그검색", "해시태그_"+srchHash);
		} else {
			var srchTxt = $(this).parents(".searchfield").find("input[id='basicSearchTerm']").val().replace(/\s/g, "");
			GA_Event("click_PC_영문_검색", "검색전", "검색전_일반검색", "검색어_"+srchTxt);
		};
	});*/
	
	$(document).on("click", ".area-gnb .wrap-gnb-search .searchfield button", function () {
		var srchTxt = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "검색전", "검색전_검색유형선택", srchTxt);//해시태그검색, 일반검색
	});
	$(document).on("click", ".area-gnb .advanced_search #searchTabBox li", function () {
		var tabNm = $(this).parents("#searchTabBox").find("li.ui-tabs-active").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "검색전", "검색전_탭", "탭_"+tabNm);
	});
	$(document).on("click", ".area-gnb .advanced_search .search-recent-wrap .search-recent .toggle-switch-auto-save label input[id='autoSaveBtn']", function () {
		if ($(this).is(":checked") == true){
			GA_Event("click_PC_영문_검색", "검색전", "검색전_최근검색어", "자동저장켜기");
		} else {
			GA_Event("click_PC_영문_검색", "검색전", "검색전_최근검색어", "자동저장끄기");
		}
	});
	$(document).on("click", ".area-gnb .advanced_search .search-recent-wrap .search-recent #deleteAll", function () {
		GA_Event("click_PC_영문_검색", "검색전", "검색전_최근검색어", "전체삭제");
	});
	$(document).on("click", ".area-gnb .advanced_search .search-recent-wrap .search-result-wrap #rcntKeyword li", function () {
		var srchTxt = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "검색전", "검색전_최근검색어", "검색어_"+srchTxt);
	});

	$(document).on("click", ".area-gnb .advanced_search .search-hit-content-wrap .pc-search-hit-swiper .search-hit-box li", function () {
		var srchTxt = $(this).find(".hit-name").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "검색전", "검색전_인기검색어", "검색어_"+srchTxt);
	});
	$(document).on("click", ".area-gnb .advanced_search .search-hit-content-wrap .pc-search-hit-hastag-swiper  .search-hit-box li", function () {
		var srchTxt = $(this).find(".hit-name").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "검색전", "검색전_인기해시태그검색어", "검색어_"+srchTxt);
	});
	$(document).on("click", ".area-gnb .advanced_search .hot-brand-emotion li button", function () {
		var branNm = $(this).find("p").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "검색전", "검색전_브랜드검색", "HOT브랜드_"+branNm);
	});
	$(document).on("click", ".area-gnb .advanced_search .brand-category-wrap #cateList ul li button", function () {
		var cateNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "검색전", "검색전_브랜드검색", "카테고리_"+cateNm);
	});
	$(document).on("click", ".area-gnb .advanced_search .kr-en-conversion-wrap .sortbtn_wrap button", function () {
		if ($(this).attr("data-lang") == "kr") {
			GA_Event("click_PC_영문_검색", "검색전", "검색전_브랜드검색", "정렬_가나다순");
		} else if ($(this).attr("data-lang") == "en") {
			GA_Event("click_PC_영문_검색", "검색전", "검색전_브랜드검색", "정렬_ABC순");
		}
	});
	$(document).on("click", ".area-gnb .advanced_search .kr-en-conversion-wrap .initial-sound.brand_cate ul li button", function () {
		var sortNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "검색전", "검색전_브랜드검색", "정렬기준_"+sortNm);
	});
	$(document).on("click", ".area-gnb .advanced_search .kr-en-conversion-data-content ul li", function () {
		var branNm = $(this).find("p:nth-of-type(1)").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "검색전", "검색전_브랜드검색", "브랜드_"+branNm);
	});
	
	$(document).on("click", ".area-gnb .advanced_search .general-search-wrap .general-search-link a", function () {
		var srchBran = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "자동완성", "자동완성_일반검색_연관검색어", "키워드_"+srchBran);
	});
	$(document).on("click", ".area-gnb .advanced_search .general-search-wrap .searchresults_brand_renew a", function () {
		var srchBran = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "자동완성", "자동완성_일반검색_연관검색어", "브랜드_"+srchBran);
	});
	$(document).on("click", ".area-gnb .advanced_search .general-search-wrap .searchresults_brand_renew a", function () {
		var srchBran = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "자동완성", "자동완성_일반검색_연관검색어", "브랜드_"+srchBran);
	});
	$(document).on("click", ".area-gnb .advanced_search .general-search-wrap .searchresults_word a", function () {
		var srchBran = $(this).find("span.pink").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "자동완성", "자동완성_일반검색_연관브랜드", "검색어_"+srchBran);
	});
	$(document).on("click", ".area-gnb .advanced_search .general-search-wrap .hashtag_box a", function () {
		var srchBran = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색", "자동완성", "자동완성_해시태그검색_연관검색어", "해시태그_"+srchBran);
	});
	$(document).on("click", ".area-gnb .wrap-gnb-logo .wrap-gnb-search .advanced_search .search_close", function () {
		GA_Event("click_PC_영문_검색", "검색", "검색_설정", "취소");
	});
	$(document).on("click", ".area-gnb .advanced_search .search-interface-wrap .search-interface button", function () {
		// 아직 기능 개발 전이라 class, id값 없어서, 임시로 이미지명으로 조건문 작업 ----> 화면 확인 불가
		if ($(this).find("img").attr("src").indexOf("ico_mic") > -1) {
			GA_Event("click_PC_영문_검색", "검색", "검색_설정", "음성인식");
		} else if ($(this).find("img").attr("src").indexOf("ico_qrcode") > -1) {
			GA_Event("click_PC_영문_검색", "검색", "검색_설정", "QR코드");
		}
	});
	/* 검색 End */

	/* 검색결과 Start */
	$(document).on("click", ".product-search-list-result-wrap .result_list button", function () {
		var srchRelated = $(this).text().replace(/\s/g, "");
		GA_Event("click_PC_영문_검색결과", "검색결과", "검색결과_연관검색어", "연관검색어_"+srchRelated);
	});
	$(document).on("click", ".product-search-list-result-wrap .suggestion-prdouct-wrap .product__item a", function () {
		var txtProd = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		if($(".product-search-list-result-wrap #noResultSet").is(":visible")){
			GA_Event("click_PC_영문_검색결과", "검색결과없음", "상품추천", "상품_"+txtProd);
		} else {
			GA_Event("click_PC_영문_검색결과", "검색결과", "상품추천", "상품_"+txtProd);
		}
	});
	$(document).on("click", ".product-search-list-result-wrap .suggestion-prdouct-wrap .product__item a .btn-cart", function () {
		var txtProd = $(this).parents(".product__item").find(".product__brand-info").text().replace(/\s/g, "");
		if($(".product-search-list-result-wrap #noResultSet").is(":visible")){
			GA_Event("click_PC_영문_검색결과", "검색결과없음", "상품추천", "장바구니담기_"+txtProd);
		} else {
			GA_Event("click_PC_영문_검색결과", "검색결과", "상품추천", "장바구니담기_"+txtProd);
		}
	});
	/* 검색결과 End */
	/* E: 검색 */
	/* E: 2023 개선 : 20231212 */
});


let commonData = {};
let virCommonData = {};
let browserInfo = navigator.userAgent;

// 빈 매개변수 제거
function convertElement(removeValue){
	let returnValue = {};
	for(key in removeValue){
		if(!removeValue[key]){
			delete removeValue[key]
		}
	}
	returnValue = removeValue;

	return returnValue
}

// 하이브리드 함수
function hybrid(object){
	let emptyObject = JSON.parse(JSON.stringify(convertElement(commonData)));
	let GAData = Object.assign(emptyObject, convertElement(object));
	if (browserInfo.indexOf('GA_Android') > -1) {
		window.android.GA_DATA(JSON.stringify(GAData));
	} else if (browserInfo.indexOf('GA_iOS_WK') > -1) {
		webkit.messageHandlers.hddfsgascriptCallbackHandler.postMessage(JSON.stringify(GAData));  
	}
}

// 가상페이지 하이브리드 함수
function virHybrid(object){
	let emptyObject = JSON.parse(JSON.stringify(convertElement(virCommonData)));
	let GAData = Object.assign(emptyObject, convertElement(object));
	if (browserInfo.indexOf('GA_Android') > -1) {
		window.android.GA_DATA(JSON.stringify(GAData));
	} else if (browserInfo.indexOf('GA_iOS_WK') > -1) {
		webkit.messageHandlers.hddfsgascriptCallbackHandler.postMessage(JSON.stringify(GAData));  
	}
}

// 공통 화면 함수
function GA_Screen(object){
	try{
		commonData = object;
		if (browserInfo.indexOf('GA_iOS_WK')>-1 || browserInfo.indexOf('GA_Android')>-1) {
			commonData.type = 'P';
			hybrid(commonData);
		} else {
			(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
			new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
			j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
			'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
			})(window,document,'script','dataLayer','GTM-KMNW5DW');
		};
	} catch(e) {
		console.log('GA_Screen 함수 ERROR');
	};
}

// 가상 페이지 뷰
function GA_Virtual(virtualObject){
	try{
		virCommonData = virtualObject;
		if(browserInfo.indexOf('GA_iOS_WK') > -1 || browserInfo.indexOf('GA_Android') > -1){ 
			virtualObject.type = 'P'
			virHybrid(virtualObject);
		} else {
			virtualObject.event = 'ga_virtual';
			dataLayer.push(convertElement(virtualObject));
		}
	} catch(e) {
		console.log('GA_Virtual 함수 ERROR')
	}

}

// 공통 이벤트 함수
function GA_Event(event_name, ep_button_area, ep_button_area2, ep_button_name, isVirtual){
	try{
		let GAData = {
			event_name,
			ep_button_area,
			ep_button_area2,
			ep_button_name,
		};

		if (browserInfo.indexOf('GA_iOS_WK') > -1 || browserInfo.indexOf('GA_Android') > -1) {
			GAData.type = "E";
			if (isVirtual) {
				virHybrid(GAData); 
			} else {
				hybrid(GAData);
			}
		} else {
			GAData.event = 'ga_event';
			if (isVirtual) {
				let virtualObject = virCommonData;
				GAData = Object.assign(virtualObject, GAData);
				dataLayer.push(GAData);
			} else {
				dataLayer.push(GAData);
			}
			setDataLayer();
		};
	}catch(e){
		console.log('GA_Event 함수 ERROR');
	};
}

// 공통 전자상거래 함수
function GA_Ecommerce(E_step, items, actionList, ecommerceHit, isVirtual) {
	try{
		if (browserInfo.indexOf('GA_Android') > -1 || browserInfo.indexOf('GA_iOS_WK') > -1) { 
			let APPData = {
				items,
				event_name: E_step,
				type: 'E',
				transaction: actionList,
			};
			let GAData = Object.assign(APPData, ecommerceHit);
			if (isVirtual) {
				virHybrid(GAData);
			} else {
				hybrid(GAData);
			}

		} else {
			let ecommerce = { items };
			let ecommerceData = Object.assign(ecommerce, actionList);
			let GAData = Object.assign({}, ecommerceHit);
			GAData.event = 'ga_ecommerce';
			GAData.event_name = E_step;
			GAData.ecommerce = ecommerceData;
			if (isVirtual) {
				let virtualObject = virCommonData;
				GAData = Object.assign(virtualObject, GAData);
				dataLayer.push(GAData);
			} else {
				dataLayer.push(GAData);
			}
			setDataLayer();
		};
	} catch(e) {
		console.log('GA_Ecommerce 함수 ERROR');
	};
}

// 초기화 함수
function setDataLayer() {
	let setGTM = {};
	for (value of dataLayer) {
		for (key in value) {
			if((!key.includes('ep_search') && !key.includes('ep_visit') && !key.includes('ep_page') && key.includes('ep_')) || key.includes('cm_') || key.includes('ecommerce') || key.includes('event_name')) {
				setGTM[key] = undefined;
			};
		};
	};
	return dataLayer.push(setGTM);
}