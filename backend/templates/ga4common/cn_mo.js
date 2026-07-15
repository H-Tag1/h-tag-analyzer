/* GA4 Common JS */
$(window).on("load", function () {
	/* 설정 Start */
	//설정 > 로그인 설정
	$(".container .setting_list .ico_coma.link_logout.check_dim").on("click", function () { GA_Event("click_MO_중문_설정", "로그인설정", "로그인설정", "로그아웃"); });
	$(".container .setting_list label[for='autoLogin'] span").on("click", function () {
		//on
		if (!$(".container").find("input#autoLogin").is(":checked")) {
			GA_Event("click_MO_중문_설정", "로그인설정", "로그인설정_자동로그인", "ON");
			//off
		} else {
			GA_Event("click_MO_중문_설정", "로그인설정", "로그인설정_자동로그인", "OFF");
		};
	});
	/*
	//설정 > SNS 간편로그인 설정
	$(".container .setting_list .sns_dim").on("click", function () {
		//on
		if (!$(this).parents(".switch.ty02.bg_black").find("input").is(":checked")) {
			if ($(this).parents(".switch.ty02.bg_black").find("input").is("#snsLogin1")) {
				GA_Event("click_MO_중문_설정", "SNS간편로그인설정", "SNS간편로그인설정_웨이보", "ON");
			};
			if ($(this).parents(".switch.ty02.bg_black").find("input").is("#snsLogin2")) {
				GA_Event("click_MO_중문_설정", "SNS간편로그인설정", "SNS간편로그인설정_QQ", "ON");
			};
			if ($(this).parents(".switch.ty02.bg_black").find("input").is("#snsLogin3")) {
				GA_Event("click_MO_중문_설정", "SNS간편로그인설정", "SNS간편로그인설정_위챗", "ON");
			};
			if ($(this).parents(".switch.ty02.bg_black").find("input").is("#snsLogin4")) {
				GA_Event("click_MO_중문_설정", "SNS간편로그인설정", "SNS간편로그인설정_알리페이", "ON");
			};
			if ($(this).parents(".switch.ty02.bg_black").find("input").is("#snsLogin5")) {
				GA_Event("click_MO_중문_설정", "SNS간편로그인설정", "SNS간편로그인설정_바이두", "ON");
			};
		//off
		} else {
			if ($(this).parents(".switch.ty02.bg_black").find("input").is("#snsLogin1")) {
				GA_Event("click_MO_중문_설정", "SNS간편로그인설정", "SNS간편로그인설정_웨이보", "OFF");
			};
			if ($(this).parents(".switch.ty02.bg_black").find("input").is("#snsLogin2")) {
				GA_Event("click_MO_중문_설정", "SNS간편로그인설정", "SNS간편로그인설정_QQ", "OFF");
			};
			if ($(this).parents(".switch.ty02.bg_black").find("input").is("#snsLogin3")) {
				GA_Event("click_MO_중문_설정", "SNS간편로그인설정", "SNS간편로그인설정_위챗", "OFF");
			};
			if ($(this).parents(".switch.ty02.bg_black").find("input").is("#snsLogin4")) {
				GA_Event("click_MO_중문_설정", "SNS간편로그인설정", "SNS간편로그인설정_알리페이", "OFF");
			};
			if ($(this).parents(".switch.ty02.bg_black").find("input").is("#snsLogin5")) {
				GA_Event("click_MO_중문_설정", "SNS간편로그인설정", "SNS간편로그인설정_바이두", "OFF");
			};
		};
	});
	*/
	//설정 > 알림(PUSH) 설정
	$(".container .setting_list label[for='pushApp'] span").on("click", function () {
		//on
		if (!$(".container").find("input#pushApp").is(":checked")) {
			GA_Event("click_MO_중문_설정", "알림(PUSH)설정", "알림(PUSH)설정_마케팅앱알림", "마케팅(광고성)_앱_알림_ON");
			//off
		} else {
			GA_Event("click_MO_중문_설정", "알림(PUSH)설정", "알림(PUSH)설정_마케팅앱알림", "마케팅(광고성)_앱_알림_OFF");
		};
	});
	//설정 > 가이드 설정
	$(".container .setting_list label[for='guideApp'] span").on("click", function () {
		//on
		if (!$(".container").find("input#guideApp").is(":checked")) {
			GA_Event("click_MO_중문_설정", "가이드설정", "가이드설정_가이드보기", "가이드보기_ON");
			//off
		} else {
			GA_Event("click_MO_중문_설정", "가이드설정", "가이드설정_가이드보기", "가이드보기_OFF");
		};
	});

	//설정 > 고객센터
	$(".container .setting_list .ico_coma.link_qna").on("click", function () { GA_Event("click_MO_중문_설정", "고객센터", "고객센터_모바일고객센터", "바로가기"); });
	$(".container .setting_list .ico_coma.link_tel").on("click", function () { GA_Event("click_MO_중문_설정", "고객센터", "고객센터_전화연결", "전화번호"); });
	/* 설정 End */

	/* 메인 Start */
	// 메인화면 팝업
	$(document).on("click", ".main_bottom_pop .visual_item a", function () {
		if ($(this).attr("href") != "javascript:") {
			var bnnrName = $(this).find("img").attr("alt").replace(/\s/g, '');
			GA_Event("click_MO_중문_메인", "메인배너", "메인배너_팝업", "배너_" + bnnrName);
		};
	});
	$(document).on("click", ".main_bottom_btn_area .popCloseBtn:first-of-type", function () {
		GA_Event("click_MO_중문_메인", "메인배너", "메인배너_팝업", "오늘하루보지않기");
	});
	$(document).on("click", ".main_bottom_btn_area .popCloseBtn:last-of-type", function () {
		GA_Event("click_MO_중문_메인", "메인배너", "메인배너_팝업", "닫기");
	});
	
	/* S: GA4 메인 리뉴얼 20230616 */
	// 상단메뉴 
	// 20260309 수정
	// $(document).on("click", ".main-category-link .list-category-link li a", function(){
	// 	var btnNm = $(this).find(".category-link__txt").text().replace(/\s/g, "");
	// 	GA_Event("click_MO_중문_메인", "상단메뉴", "상단메뉴_카테고리", btnNm);
	// });
	$(document).on("click", ".main-category-link .list-category-link li a", function() {
		var idx = $(this).closest('li').index();
		var menuNm = $(this).data("dispnm").replace(/\s/g, "");
		var area2 = "";

		if (idx < 4) {
			area2 = "GNB_공통";
		} else {
			area2 = "GNB_행사";
		}

		GA_Event("click_MO_중문_공통", "GNB", area2, menuNm);
	});
	
	// 메인배너
	$(document).on("click", ".main-visual-swiper .visual__item a", function(){
		if ($(this).find("img").length > 0){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_메인", "메인배너", "메인배너", "배너_"+bnnrNm);
		} else {
			var bnnrNm = $(this).find("video").attr("data-info").replace(/\s/g, "");
			GA_Event("click_MO_중문_메인", "메인배너", "메인배너", "배너_"+bnnrNm);
		}
	});
	// 메인배너 - 스와이프(/js/M_KO/_main.ui.js)
	
	// 메인배너 더보기 버튼
	$(".main-visual-swiper .btn-view button[onclick='javascript:openBnnrLayer();']").on("click", function(){
		GA_Event("click_MO_중문_메인", "메인배너", "메인배너", "전체보기");
	});

	// 메인배너 전체보기 팝업
	$(document).on("click", "#product_pop_img .layer_popup ul li a", function(){
		var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "메인배너", "메인배너_전체보기", "배너_"+bnnrNm);
	});

	// 메인배너 전체보기 팝업 닫기
	$(document).on("click", ".main_popup .ui-dialog-titlebar .ui-dialog-titlebar-close", function(){
		GA_Event("click_MO_중문_메인", "메인배너", "메인배너_전체보기", "닫기");
	});
	
	// 오늘의특가
	$(document).on("click", ".special-price .box-tit a", function(){
		GA_Event("click_MO_중문_메인", "오늘의특가", "오늘의특가", "더보기");
	});
	$(document).on("click", ".special-price .tab-special-price li", function(){
		var tabNm = $(this).find("button").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "오늘의특가", "오늘의특가_탭", "탭_"+tabNm);
	});
	$(document).on("click", ".special-price .list-product > li .product__item", function(){
		var tabNm = $(this).parents(".special-price").find(".tab--list li.is-active button").text().replace(/\s/g, "");
		if ($(this).find(".product__remain").length > 0){
			var branNm = $(this).find(".product__img--logo img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_메인", "오늘의특가", "오늘의특가_탭_"+tabNm, "브랜드_"+branNm);
		} else {
			var branNm = $(this).find(".product__brand").text().replace(/\s/g, ""),
				prodNm = $(this).find(".product__brand-info").text().replace(/\s/g, "");
			GA_Event("click_MO_중문_메인", "오늘의특가", "오늘의특가_탭_"+tabNm, "상품_"+branNm+"_"+prodNm);
		}
	});
	
	// 당신을 위한 상품 추천
	$(document).on("click", ".ai-recommend .swiper__ai-product .swiper-slide a", function(){
		let prodText = $(this).parents(".swiper-slide").find(".brand_ex.goosNm").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "상품추천", "상품_"+prodText, "바로가기");
	});
	$(document).on("click", ".ai-recommend .swiper__ai-product .swiper-slide .btn-cart", function(){
		let prodText = $(this).parents(".swiper-slide").find(".brand_ex.goosNm").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "상품추천", "상품_"+prodText, "장바구니 담기");
	});

	//베스트셀러
	$(document).on("click", ".main-bestseller .box-tit a", function(){
		GA_Event("click_MO_중문_메인", "베스트셀러", "베스트셀러", "더보기");
	});
	$(document).on("click", ".main-bestseller .product-more-link a", function(){
		let cateText = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "베스트셀러", "베스트셀러", cateText);
	});
	// $(document).on("click", ".main-bestseller .tab-bastseller button", function(){
	// 	let cateText = $(this).text().replace(/\s/g, "");
	// 	GA_Event("click_MO_중문_메인", "베스트셀러", "베스트셀러_탭", "탭_"+cateText);
	// });
	$(document).on("click", ".main-bestseller .list-product__searchlist li a", function(){
		let cateText = $(".main-bestseller .tab-bastseller .is-active button").text().replace(/\s/g, "");
		let prodText = $(this).parents("li").find(".brand_ex.goosNm").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "베스트셀러", "베스트셀러_탭_"+cateText, "상품_"+prodText);
	});
	$(document).on("click", ".main-bestseller .list-product__searchlist li .cart a", function(){
		let cateText = $(".main-bestseller .tab-bastseller .is-active button").text().replace(/\s/g, "");
		let prodText = $(this).parents("li").find(".brand_ex.goosNm").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "베스트셀러", "베스트셀러_탭_"+cateText, "장바구니 담기_"+prodText);
	});

	//첫구매딜
	$(document).on("click", ".first-deal .box-tit a", function(){
		GA_Event("click_MO_중문_메인", "첫구매딜", "첫구매딜", "더보기");
	});
	$(document).on("click", ".first-deal .swiper__first-deal .product__item a", function(){
		let prodText = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "첫구매딜", "첫구매딜_상품_"+prodText, "바로가기");
	});
	$(document).on("click", ".first-deal .swiper__first-deal .product__item .btn-cart", function(){
		let prodText = $(this).parents(".product__item").find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "첫구매딜", "첫구매딜_상품_"+prodText, "장바구니 담기");
	});

	// 쇼핑혜택
	$(document).on("click", ".customer-benefit .tab--list.customer-benefit__list li button", function(){
		var tabNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "쇼핑혜택", "쇼핑혜택_탭", "탭_"+tabNm);
	});
	$(document).on("click", ".customer-benefit .tab-content .customer-benefit__item", function(){
		var tabNm = $(this).parents(".customer-benefit").find(".customer-benefit__list li.is-active button").text().replace(/\s/g, ""),
			tabContNm = $(this).find(".customer-benefit__tit").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "쇼핑혜택", "쇼핑혜택_탭_"+tabNm, "배너_"+tabContNm);
	});
	$(document).on("click", ".customer-benefit .tab-content.is-active .product-more-link", function(){
		var tabNm = $(this).parents(".customer-benefit").find(".customer-benefit__list li.is-active button").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "쇼핑혜택", "쇼핑혜택_탭_"+tabNm, "혜택더보기");
	});
	
	// H.TREND (구, THEFRONTROW)
	$(document).on("click", ".front-row .box-tit a", function(){
		GA_Event("click_MO_중문_메인", "H.TREND", "H.TREND", "더보기");
	});
	$(document).on("click", ".front-row .swiper__front-row .swiper-slide > a", function(){
		var bnnrNm = $(this).parents(".swiper-slide").find(".front-row__tit").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "H.TREND", "H.TREND배너", "배너_"+bnnrNm);
	});
	$(document).on("click", ".front-row .product__item a", function(){
		var bnnrNm = $(this).parents(".swiper-slide").find(".front-row__tit").text().replace(/\s/g, ""),
			prodNm = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "H.TREND", "H.TREND배너_"+bnnrNm, "상품_"+prodNm);
	});
	
	// 띠배너
	$(document).on("click", ".main-banner .main-banner__item a", function(){
		var bnnrNm = $(this).find(".main-banner__tit").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "띠배너", "띠배너", "배너_"+bnnrNm);
	});
	
	// 공구특가
	$(document).on("click", ".h-share .product__item", function(){
		var branNm = $(this).find(".product__brand").text().replace(/\s/g, ""),
			prodNm = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "공구특가", "공구특가_상품", "상품_"+branNm+"_"+prodNm);
	});
	$(document).on("click", ".h-share .product-more-link a", function(){
		GA_Event("click_MO_중문_메인", "공구특가", "공구특가_상품", "특가상품더보기");
	});
	/* E: GA4 메인 리뉴얼 20230616 */
	
	/* S: 3차 개선건 GA4 20231212 */
	// 메인검색
	$(document).on("click", ".wrap-gnb-search .sh_top .sh_rht .sh_btn_search", function () {
		GA_Event("click_MO_중문_메인", "메인검색", "메인검색", "검색창열기");
	});
	$(document).on("click", ".wrap-gnb-search .sh_top .sh_rht #srchCond", function () {
		if ($(this).is(".sh_btn_text") == true) {
			GA_Event("click_MO_중문_메인", "메인검색", "메인검색_검색유형선택", "해시태그검색");
		} else {
			GA_Event("click_MO_중문_메인", "메인검색", "메인검색_검색유형선택", "일반검색");
		};
	});

	// 띠배너 
	$(document).on("click", ".ps_main_box_wrap .ps_main_box .ps_main_box_info .ps_link", function () {
		var bnnrNm = $(this).parents(".ps_main_box_info").find(".ps_main_box_info_text .text_gradi").text().replace(/\s/g, '');
		GA_Event("click_MO_중문_메인", "띠배너", "띠배너", "배너_" + bnnrNm);
	});

	// #캐치태그
	$(document).on("click", ".hash-tag .tab-hash-tag.tab--list li button", function(){
		var tabNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "#캐치태그", "#캐치태그_탭", "탭_"+tabNm);
	});
	$(document).on("click", ".hash-tag .list-product > li .product__item button.coupon__btn", function(){
		var tabNm = $(this).parents(".hash-tag").find(".tab--list li.is-active button").text().replace(/\s/g, ""),
			mainTxt = $(this).find(".product__brand").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "#캐치태그", "#캐치태그_탭_"+tabNm, "적립금_" + mainTxt);		// #캐치태그 > 적립금
	});
	$(document).on("click", ".hash-tag .list-product > li .product__item a", function(){
		var tabNm = $(this).parents(".hash-tag").find(".tab--list li.is-active button").text().replace(/\s/g, ""),
			mainTxt = $(this).find(".product__brand").text().replace(/\s/g, ""),
			subTxt = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		if($(this).attr("href").indexOf("dtlSpex.do") > -1){
			GA_Event("click_MO_중문_메인", "#캐치태그", "#캐치태그_탭_"+tabNm, "기획전_" + mainTxt); // #캐치태그 > 기획전
		} else if ($(this).attr("href").indexOf("evntDetail.do") > -1){
			GA_Event("click_MO_중문_메인", "#캐치태그", "#캐치태그_탭_"+tabNm, "이벤트_" + mainTxt); // #캐치태그 > 이벤트
		} else if ($(this).attr("href").indexOf("trendhDetail.do") > -1){
			GA_Event("click_MO_중문_메인", "#캐치태그", "#캐치태그_탭_"+tabNm, "TREND.H_" + mainTxt); // #캐치태그 > TREND.H
		} else if ($(this).attr("href").indexOf("brand.do") > -1){
			GA_Event("click_MO_중문_메인", "#캐치태그", "#캐치태그_탭_"+tabNm, "브랜드_" + mainTxt); // #캐치태그 > 브랜드
		} else if ($(this).attr("href").indexOf("goos.do") > -1){
			GA_Event("click_MO_중문_메인", "#캐치태그", "#캐치태그_탭_"+tabNm, "상품_" + subTxt); // #캐치태그 > 상품
		}
	});
	$(document).on("click", ".hash-tag .hash-tag-btn a", function(){
		var tabNm = $(this).parents(".hash-tag").find(".tab-hash-tag li.is-active button").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_메인", "#캐치태그", "#캐치태그_탭_"+tabNm, "더보기");
	});
	/* 메인 End */

	//20250925 리뉴얼 추가 
	/* 메인 Start */
	// 20260309 수정
	$(document).on("click", ".bnr-branads .branads", function(){
		const url = new URL(this.href);
		const params = new URLSearchParams(url.search);
		const onlnBranCd = params.get("onlnBranCd");
		let bannerText = $(this).data("dispnm").replace(/\s/g, "");

		GA_Event("click_MO_문_메인", "상단배너", "상단배너", "배너_"+bannerText);
	});


	$(document).on("click", ".main-dashboard .dashboard-scroll a", function(){
		var menuNm = $(this).find("span").text().replace(/\s/g, "")
    	GA_Event("click_MO_국문_메인", "대시보드", "대시보드_메뉴", "메뉴_"+menuNm);
	});

	$(document).on("click", ".ai-recommend-renew .main-box a", function(){
    	GA_Event("click_MO_국문_메인", "상품추천", "상품추천", "출국정보등록");
	});

	$(document).on("click", ".ai-recommend-renew .main-box .main-box__title a", function(){
		GA_Event("click_MO_국문_메인", "상품추천", "상품추천", "혜택모아보기");
	});

	$(document).on("click", ".ai-recommend-renew .renew_product__item a", function(){
		var prdNm = $(this).find(".renew_product__name").text().replace(/\s/g, "")
    	GA_Event("click_MO_국문_메인", "상품추천", "상품추천_상품", "상품_"+prdNm);
	});
	
	$(document).on("click", ".ai-recommend-renew .renew_product__item #wishPop", function(){
		var prdNm = $(this).parents(".renew_product__item").find(".renew_product__name").text().replace(/\s/g, "");
		GA_Event("click_MO_국문_메인", "상품추천", "상품_"+prdNm, "찜하기");
	});

	$(document).on("click", ".ai-recommend-renew .renew_product__item .renew_product__cart button", function(){
		var prdNm = $(this).parents(".renew_product__item").find(".renew_product__name").text().replace(/\s/g, "");
		var btnNm = $(this).text().replace(/\s/g, "")
    	GA_Event("click_MO_국문_메인", "상품추천", "상품_"+prdNm, btnNm);
	});

	$(document).on("click", ".special-price .main-box .btn_title-more", function(){
		GA_Event("click_MO_국문_메인", "오늘의특가", "오늘의특가", "전체보기");
	});

	$(document).on("click", ".special-price .tab-special-price button", function(){
		var tabNm = $(this).text().replace(/\s/g, "")
		GA_Event("click_MO_국문_메인", "오늘의특가", "오늘의특가_탭", "탭_"+tabNm);
	});

	$(document).on("click", ".special-price .renew_product__item a", function(){
		var tabNm = $(this).parents(".special-price").find(".tab-special-price .is-active button").text().replace(/\s/g, "");
		var prdNm = $(this).find('.renew_product__name').text().replace(/\s/g, "")
		GA_Event("click_MO_국문_메인", "오늘의특가", "오늘의특가_탭_"+tabNm, "상품_"+prdNm);
	});

	$(document).on("click", ".special-price .renew_product__item .main-btn--like", function(){
    	GA_Event("click_MO_국문_메인", "오늘의특가", "오늘의특가_탭_특가상품", "찜하기");
	});

	$(document).on("click", ".special-price .renew_product__item .renew_product__cart button", function(){
		var btnNm = $(this).text().replace(/\s/g, "")
		GA_Event("click_MO_국문_메인", "오늘의특가", "오늘의특가_탭_특가상품", btnNm);
	});

	$(document).on("click", ".h-share .main-box .btn_title-more", function(){
		GA_Event("click_MO_국문_메인", "공구특가", "공구특가", "전체보기");
	});

	$(document).on("click", ".h-share .product__item .product__co-buying-join", function(){
		GA_Event("click_MO_국문_메인", "공구특가", "공구특가", "참여하기");
	});

	$(document).on("click", ".first-deal-renew .main-box .btn_title-more", function(){
	    GA_Event("click_MO_국문_메인", "첫구매딜", "첫구매딜", "전체보기");
	});

	$(document).on("click", ".first-deal-renew .renew_product__item a", function(){
		var prdNm = $(this).find('.renew_product__name').text().replace(/\s/g, "")
		GA_Event("click_MO_국문_메인", "첫구매딜", "첫구매딜_상품", "상품_"+prdNm);
	});

	$(document).on("click", ".first-deal-renew .renew_product__item .renew_product__cart button", function(){
		var prdNm = $(this).parents(".renew_product__item").find(".renew_product__name").text().replace(/\s/g, "");
		var btnNm = $(this).text().replace(/\s/g, "")
		GA_Event("click_MO_국문_메인", "첫구매딜", "상품_"+prdNm, btnNm);
	});

	$(document).on("click", ".main-bestseller .main-box .btn_title-more", function(){
		GA_Event("click_MO_국문_메인", "베스트", "베스트", "전체보기");
	});

	$(document).on("click", ".main-bestseller .tab-bastseller button", function(){
		var tabNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_국문_메인", "베스트", "베스트_탭", "탭_"+tabNm);
	});

	$(document).on("click", ".main-bestseller .renew_product_best__group .renew_product_best__unit", function(){
		var tabNm = $(this).parents(".main-bestseller").find(".tab-bastseller .is-active button").text().replace(/\s/g, "");
		var prdNm = $(this).find(".renew_product_best__name").text().replace(/\s/g, "");
		GA_Event("click_MO_국문_메인", "베스트", "탭_"+tabNm, "상품_"+prdNm);
	});

	$(document).on("click", ".main-bestseller .renew_product_best__group .renew_product_best__cart button", function(){
		var prdNm = $(this).parents('.renew_product_best__item').find(".renew_product_best__name").text().replace(/\s/g, "");
		var btnNm = $(this).text().replace(/\s/g, "")
		GA_Event("click_MO_국문_메인", "베스트", "상품_"+prdNm, btnNm);
	});

	
	$(document).on("click", ".hash-tag .hash-tag-banner .hash-tag-banner__info", function(){
		var tabNm = $(this).parents('.hash-tag').find('.tab-hash-tag .is-active button').text().replace(/\s/g, "")
		GA_Event("click_MO_국문_메인", "#캐치태그", "#캐치태그_탭_"+tabNm, "상단배너");
	});


	/* 메인 End */
	
	/* 메인 큐레이션 Start */
	// 로그인 전
	$(document).on("click", ".personal .login_btn button", function(){
		GA_Event("click_MO_중문_큐레이션", "여행정보", "여행정보_로그인전", "로그인하기");
	});
	// 로그인 후 
	$(document).on("click", ".personal .ps_info_top .ps_detail_wrap.non_member .ps_detail_btn button", function(){
		if ($(this).hasClass("resister_exit") == true) {
			GA_Event("click_MO_중문_큐레이션", "여행정보", "여행정보_정보등록", "출국정보등록");
		} else if ($(this).hasClass("resister_passport") == true) {
			GA_Event("click_MO_중문_큐레이션", "여행정보", "여행정보_정보등록", "여권정보등록");
		}
	});
	$(document).on("click", ".personal .ps_info_top .ps_detail_wrap .ps_detail .detail_inner button", function(){
		if ($(this).parents(".ps_detail").hasClass("passport") == true) {
			GA_Event("click_MO_중문_큐레이션", "여행정보", "여행정보_정보등록", "여권정보등록");
		} else if ($(this).parents(".ps_detail").hasClass("exit") == true) {
			GA_Event("click_MO_중문_큐레이션", "여행정보", "여행정보_정보등록", "출국정보등록");
		}  else if ($(this).parents(".ps_detail").hasClass("pick") == true) {
			GA_Event("click_MO_중문_큐레이션", "여행정보", "여행정보", "상품픽업위치확인");
		} 
	});
	$(document).on("click", ".personal .ps_benefits .benefits-slider .swiper-slide .product__item a", function(){
		var bnnrNm = $(this).find(".product__brand").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_큐레이션", "여행정보", "혜택바로보기", bnnrNm);
	});
	$(document).on("click", ".personal .ps_quration .ps_tab li button", function(){
		var tabNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션취향_탭", "탭_" + tabNm);
	});

	// 큐레이션 만들기 전
	$(document).on("click", ".personal .ps_quration .ps_tab_content .ps_bene_tab_check_list .ps_bene_tab_check_content input[type=checkbox] + label", function(){
		var tabNm = $(".personal .ps_quration .ps_tab li.is-active button").text().replace(/\s/g, ""),
			catNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션취향_"+tabNm, "카테고리_" + catNm);
	});
	$(document).on("click", ".personal .ps_bene_btn button", function(){
		var tabNm = $(".personal .ps_quration .ps_tab li.is-active button").text().replace(/\s/g, "");
		if ($(this).hasClass("btn_curation") == true) {
			GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션취향_"+tabNm, "쇼핑큐레이션만들기");
		} else if ($(this).hasClass("btn_recent") == true) {
			GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션취향_"+tabNm, "최근큐레이션다시보기");
		}
	});
	// 큐레이션 만들기 후
	$(document).on("click", ".personal .ps_quration.type-result .qr_keyword .keyword_modify button[onclick='fnCrtnChange();']", function(){
		GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션결과", "수정");
	});
	$(document).on("click", ".personal .ps_quration.type-result .qr_result .refresh button[onclick='fnReloadList();']", function(){
		GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션결과", "큐레이션컨텐츠새로고침");
	});
	
	// 큐레이션 결과 영역
	// 탭_혜택 : 이달의혜택, 회원전용혜택, 제휴혜택, 결제혜택, 구매사은, 타임세일
	$(document).on("click", ".personal .ps_quration.type-result .qr_result > .result_prod:not(.result_prod_brand_hash) .list-product .product__item a", function(){
		var titNm = $(this).parents(".result_prod").prev(".tit").find("span").text().replace(/\s/g, ""),
			mainTxt = $(this).find(".product__brand").text().replace(/\s/g, ""),
			subTxt = $(this).find(".product__brand-info").not($(".info_peri")).text().replace(/\s/g, "");
		if ($(this).parents(".product__item").hasClass("dc_time_list") == true) {
			GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션결과_"+titNm, "브랜드_" + mainTxt); // 타임세일
		} else {
			GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션결과_"+titNm, mainTxt+"_"+subTxt); // 그 외, 모두
		}
	});
	
	// 탭_혜택 : 예비신혼부부전용, 딱하루세일 ----> 확인불가

	// 탭_혜택 : 지금 HOT한 #캐치태그
	$(document).on("click", ".personal .ps_quration.type-result .qr_result > .result_prod > a.prod_brand", function(){
		var tagNm = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션결과_지금HOT한#캐치태그", "띠배너_"+tagNm);
	});
	$(document).on("click", ".personal .ps_quration.type-result .qr_result > .result_prod.result_prod_brand_hash .list-product .product__item a", function(){
		var tagNm = $(this).parents(".result_prod").prev(".result_prod").find("span").text().replace(/\s/g, ""),
			mainTxt = $(this).parents(".product__item").find(".product__brand").text().replace(/\s/g, ""),
			subTxt = $(this).parents(".product__item").find(".product__brand-info").not($(".info_peri")).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션결과_지금HOT한#캐치태그_"+tagNm, mainTxt+"_"+subTxt);
	});
	$(document).on("click", ".personal .ps_quration.type-result .qr_result > .result_prod.result_prod_brand_hash .list-product .type-coupon button", function(){
		var tagNm = $(this).parents(".result_prod").prev(".result_prod").find("span").text().replace(/\s/g, ""),
			mainTxt = $(this).parents(".product__item").find(".product__brand").text().replace(/\s/g, ""),
			subTxt = $(this).parents(".product__item").find(".product__brand-info").not($(".info_peri")).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션결과_지금HOT한#캐치태그_"+tagNm, "혜택_"+mainTxt+"_"+subTxt);
	});

	// 탭_발견 : 지금제일저렴한, 지금많이구매한, 지금많이찾아본 ----> 확인불가

	// 탭_발견 : 명품브랜드, 쿠폰사용가능
	// 탭_탐색 : Cosmetic&Perfume, Fashion&Accessory, Liquor&Tobacco, Luxury Fashion, Souvenir&Foods, Watch&Jewelry
	$(document).on("click", ".personal .ps_quration.type-result .qr_result > .result_prod_area li > .result_prod > a.prod_brand", function(){
		var titNm = $(this).parents(".result_prod_area").prev(".tit").find("span").text().replace(/\s/g, ""),
			branNm = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션결과_"+titNm, "브랜드_"+branNm);
	});
	$(document).on("click", ".personal .ps_quration.type-result .qr_result > .result_prod_area li > .result_prod_list .list-product .product__item a", function(){
		var titNm = $(this).parents(".result_prod_area").prev(".tit").find("span").text().replace(/\s/g, ""),
			branNm = $(this).parents(".result_prod_list").prev(".result_prod").find("span").text().replace(/\s/g, ""),
			goosNm = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션결과_"+titNm, "상품_"+branNm+"_"+goosNm);
	});

	// 탭_발견 : 취향저격 그 상품, 최근본 상품
	// 탭_탐색 : 새로운상품
	$(document).on("click", ".personal .ps_quration.type-result .qr_result > .result_prod .list-product.list-product__searchlist .goosList.item", function(){
		var titNm = $(this).parents(".result_prod").prev(".tit").find("span").text().replace(/\s/g, ""),
			branNm = $(this).attr("data-brannm").replace(/\s/g, ""),
			goosNm = $(this).attr("data-goosnm").replace(/\s/g, "");
			GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션결과_"+titNm, "상품_"+branNm+"_"+goosNm);
	});
	$(document).on("click", ".personal .ps_quration.type-result .qr_result > .result_prod .list-product.list-product__searchlist .goosList.item .cart a", function(){
		var titNm = $(this).parents(".result_prod").prev(".tit").find("span").text().replace(/\s/g, "");
			GA_Event("click_MO_중문_큐레이션", "여행정보", "큐레이션결과_"+titNm, "장바구니담기");
	});
	/* 메인 큐레이션 End */
	/* E: 3차 개선건 GA4 20231212 */

	/* 공통 Start */
	// 퀵메뉴
	$(document).on("click", ".main_quick li a", function () {
		var btnName = $(this).find("span").text().replace(/\s/g, '');
		GA_Event("click_MO_중문_공통", "퀵메뉴", "퀵메뉴_더보기", btnName);
	});

	if ($("body").find(".header").length) {
		$(".header .history_back").on("click", function () {
			GA_Event("click_MO_중문_공통", "Header", "Header", "뒤로");
		});
		$('.header h1 > a[onclick="callSideMenuLayer();"]').on("click", function () {
			GA_Event("click_MO_중문_공통", "Header", "Header", "햄버거");
		});
		$(".header .search").on("click", function () {
			GA_Event("click_MO_중문_공통", "Header", "Header", "검색");
		});
		$(".header .cart").on("click", function () {
			GA_Event("click_MO_중문_공통", "Header", "Header", "장바구니");
		});
	};

	// 맨위로
	$(document).on("click", ".go_top, .layer_top_btn > a, .cart_layer_top_btn a", function () {
		GA_Event("click_MO_중문_공통", "Floating", "Floating", "맨위로");
	});

	/* S: GA4 메인 리뉴얼 20230616 */
	// 햄버거 유틸메뉴 - 언어설정
	$(document).on("click", ".gnb-util .language-choice .list-language li a", function(){
		if ($(this).hasClass("country_korea") == true){
			GA_Event("click_MO_중문_공통", "햄버거_메뉴", "햄버거_메뉴_Header", "언어_한국어");
		} else if ($(this).hasClass("country_china") == true){
			GA_Event("click_MO_중문_공통", "햄버거_메뉴", "햄버거_메뉴_Header", "언어_중국어");
		} else if ($(this).hasClass("country_english") == true){
			GA_Event("click_MO_중문_공통", "햄버거_메뉴", "햄버거_메뉴_Header", "언어_영어");
		};
	});
	// 햄버거 유틸메뉴 - 설정
	$(document).on("click", ".gnb-util .link-setting .btn-setting", function(){
		GA_Event("click_MO_중문_공통", "햄버거_메뉴", "햄버거_메뉴", "설정");
	});
	
	// 햄버거 카테고리메뉴
	$(document).on("click", ".list-quick-link li a", function(){
		var ctgyNm = $(this).contents().not($(this).children("span.tag-img")).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_공통", "햄버거_메뉴", "햄버거_메뉴_전체서비스", ctgyNm);
	});
	$(document).on("click", ".gnb-category__inner .gnb-category--list li button", function(){
		var ctgy1Depth = $(this).parents("ul").find("li.is-active button").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_공통", "햄버거_메뉴", "햄버거_메뉴_카테고리", ctgy1Depth);
	});
	$(document).on("click", ".gnb-category__inner .gnb-category--2depth li a", function(){
		var ctgy1Depth = $(this).parents(".gnb-category__inner").find(".gnb-category--list li.is-active button").text().replace(/\s/g, ""),
			ctgy2Depth = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_공통", "햄버거_메뉴", "햄버거_메뉴_"+ctgy1Depth, ctgy1Depth+"_"+ctgy2Depth);
	});

	// 햄버거 쇼룸
	$(document).on("click", ".gnb-showroom .swiper__gnb-showroom .product__item a", function(){
		var branNm = $(this).find(".product__brand").text().replace(/\s/g, ""),
			branInfo = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		if ($(this).find(".product__brand-info").is(":empty")){
			GA_Event("click_MO_중문_공통", "햄버거_메뉴", "햄버거_메뉴_쇼룸", branNm);
		} else {
			GA_Event("click_MO_중문_공통", "햄버거_메뉴", "햄버거_메뉴_쇼룸", branNm+"_"+branInfo);
		}
	});
	
	// 햄버거 푸터메뉴
	$(document).on("click", ".gnb-info-link li a", function(){
		if ($(this).parent("li").hasClass("gnb-info-link__shopping") == true){
			GA_Event("click_MO_중문_공통", "햄버거_메뉴", "햄버거_메뉴_Footer", "쇼핑안내");
		} else if ($(this).parent("li").hasClass("gnb-info-link__delivery") == true){
			GA_Event("click_MO_중문_공통", "햄버거_메뉴", "햄버거_메뉴_Footer", "인도장안내");
		} else if ($(this).parent("li").hasClass("gnb-info-link__branch") == true){
			GA_Event("click_MO_중문_공통", "햄버거_메뉴", "햄버거_메뉴_Footer", "공식사이트");
		};
	});
	/* E: GA4 메인 리뉴얼 20230616 */

	// BNB (APP BAR)
	/* S : 2025-05-16 국중영 MO 리뉴얼 앱바 GA4 업데이트 */
	// $(document).on("click", "footer .util_area .appbar a", function(){	
	// 	if ($(this).hasClass("app_home") == true) {
	// 		GA_Event("click_MO_중문_공통", "하단메뉴/하단GNB/하단탭", "하단메뉴/하단GNB/하단탭", "홈");			
	// 	} else if ($(this).hasClass("app_menu") == true) {
	// 		GA_Event("click_MO_중문_공통", "하단메뉴/하단GNB/하단탭", "하단메뉴/하단GNB/하단탭", "메뉴");			
	// 	} else if ($(this).hasClass("app_login") == true) {
	// 		GA_Event("click_MO_중문_공통", "하단메뉴/하단GNB/하단탭", "하단메뉴/하단GNB/하단탭", "로그인");			
	// 	} else if ($(this).hasClass("app_search") == true) {
	// 		GA_Event("click_MO_중문_공통", "하단메뉴/하단GNB/하단탭", "하단메뉴/하단GNB/하단탭", "검색");			
	// 	} else if ($(this).hasClass("app_myhd") == true) {
	// 		GA_Event("click_MO_중문_공통", "하단메뉴/하단GNB/하단탭", "하단메뉴/하단GNB/하단탭", "마이현대");			
	// 	} else if ($(this).hasClass("app_curation") == true) {
	// 		GA_Event("click_MO_중문_공통", "하단메뉴/하단GNB/하단탭", "하단메뉴/하단GNB/하단탭", "큐레이션"); // 2025-05-30 국중영 PC/MO 베스트 > 재입고 알림 / 큐레이션 관련 GA4 추가
	// 	};
	// });
	$(document).on("click", "#appbarLoginLayer .layer-btn a", function(){	
		if ($(this).hasClass("type-line-2") == true) {
			GA_Event("click_MO_중문_공통", "하단메뉴/하단GNB/하단탭", "하단메뉴/하단GNB/하단탭_팝업", "회원가입");			
		} else if ($(this).hasClass("type-dark-1") == true) {
			GA_Event("click_MO_중문_공통", "하단메뉴/하단GNB/하단탭", "하단메뉴/하단GNB/하단탭_팝업", "로그인");			
		};
	});	
	/* E : 2025-05-16 국중영 MO 리뉴얼 앱바 GA4 업데이트 */

	/* S : 2026-04-10 국중영 MO 리뉴얼 앱바 GA4 업데이트 */
	$(document).on("click", "footer .util_area .appbar a", function(){
		var appbarNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_공통", "하단GNB", "하단GNB", appbarNm);			
	})
	/* E : 2026-4-10 국중영 MO 리뉴얼 앱바 GA4 업데이트 */

	// Footer
	$(".foot_wrap .foot_mu li a").on("click", function () {
		var btnName = $(this).text().replace(/\s/g, '');
		GA_Event("click_MO_중문_공통", "Footer", "Footer", btnName);
	});
	$(".foot_wrap .foot_bg .foot_link_mu > li > a, .foot_wrap .foot_bg .foot_guide > li > a, .foot_wrap .foot_bg .foot_guide1 > a").on("click", function () {
		var btnName = $(this).text().replace(/\s/g, '');
		if ($(this).hasClass("company_info") == false) {
			GA_Event("click_MO_중문_공통", "Footer", "Footer_메뉴", btnName);
		};
	});
	/*
	$(".foot_wrap .foot_bg .foot_link_mu > .foot_link_family > .f_site_list ul > li > a").on("click", function () {
		var btnName = $(this).text().replace(/\s/g, '');
		GA_Event("click_MO_중문_공통", "Footer", "Footer_Familysite", btnName);
	});
	*/
	/* 공통 End */

	/* 마이현대 Start */
	// 마이현대 메뉴
	$(document).on("click", ".myhd .my-hd-wrap .hd-executives-name a", function(){
		GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_메뉴", "기본정보관리");
	});
	$(document).on("click", ".myhd .my-hd-wrap .my-tab-menu-wrap .my-od-tab .my-od-tab-list button", function(){
		var tabNm = $(this).contents().not($(this).children()).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_탭", "탭_"+tabNm); //지갑, 여권출국, 멤버십등급
	});
	$(document).on("click", ".myhd .my-hd-wrap .my-tab-menu-wrap .my-od-tab-content .my-tab--content .my-tab--content-div a", function(){
		var btnNm = $(this).parents(".my-tab--content-div").find("p");
		if (btnNm.hasClass("reserves") == true){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_탭_지갑", "적립금");
		} else if (btnNm.hasClass("coupon") == true){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_탭_지갑", "쿠폰");
		} else if (btnNm.hasClass("point") == true){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_탭_지갑", "H.point");
		} else if (btnNm.hasClass("card") == true){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_탭_지갑", "오프라인선불카드");
		}
	});
	$(document).on("click", ".myhd .my-hd-wrap .my-tab-menu-wrap .my-od-tab-content .my-tab--content .my-tab--content-div button", function(){
		var btnNm = $(this).parents(".my-tab--content-div").find("p");
		if (btnNm.hasClass("point") == true){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_탭_지갑", "통합회원전환");
		} else if (btnNm.hasClass("card") == true){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_탭_지갑", "여권정보등록");
		}
	});
	$(document).on("click", ".myhd .my-hd-wrap .my-tab-menu-wrap .my-od-tab-content .passport-departur-info-wrap .pd-info .pd-magnetic-info a", function(){
		if($(this).attr("href").indexOf("inptMbshPwd.do") > -1){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_탭_여권출국", "여권정보관리");
		} else if ($(this).attr("href").indexOf("listMbshDpatInfo.do") > -1){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_탭_여권출국", "출국정보관리");
		}
	});
	$(document).on("click", ".myhd .my-hd-wrap .my-tab-menu-wrap .my-od-tab-content .passport-departur-info-wrap .pd-info .departure-info-btn button", function(){
		if($(this).attr("onclick").indexOf("inptMbshPwd.do") > -1){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_탭_여권출국", "여권정보관리");
		} else if ($(this).attr("onclick").indexOf("listMbshDpatInfo.do") > -1){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_탭_여권출국", "출국정보관리");
		}
	});
	$(document).on("click", ".myhd .my-hd-wrap .my-tab-menu-wrap .my-od-tab-content .membership-level-wrap .membership-level a", function(){
		var levelNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_탭_멤버십등급", levelNm);
	});

	// 마이현대 메인
	$(document).on("click", ".myhd .my-hd-wrap .my-situation-swiper .my-panel .my-od-flex a", function(){
		var prodNm = $(this).find(".my-od-product-name").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_주문현황", prodNm);
	});
	$(document).on("click", ".myhd .my-hd-wrap .my-situation-swiper .my-panel .my-od-date-info a.order_num", function(){
		var prodNm = $(this).parents(".my-panel").find(".my-od-flex .my-od-product-name").text().replace(/\s/g, "");
		var orderNum = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_주문현황_"+prodNm, orderNum);
	});
	$(document).on("click", ".myhd .my-hd-wrap .my-situation-swiper .my-panel .my-od-code-view button", function(){
		var prodNm = $(this).parents(".my-panel").find(".my-od-flex .my-od-product-name").text().replace(/\s/g, "");
		if($(this).attr("onclick").indexOf("fnPrintCoup") > -1){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_주문현황_"+prodNm, "교환권보기");
		} else if($(this).attr("onclick").indexOf("fnOrderBcaInfo") > -1){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_주문현황_"+prodNm, "픽업장소보기");
		}
	});
	$(document).on("click", ".myhd .my-hd-wrap .my-suggestion-swiper .list-product.list-product__recommend .product__item a", function(){
		var prodNm1 = $(this).parents(".product__item").find(".product__brand").text().replace(/\s/g, ""),
			prodNm2 = $(this).parents(".product__item").find(".product__brand-info").not($(".type-highlight")).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_상품추천", prodNm1+"_"+prodNm2);
	});
	$(document).on("click", ".myhd .my-hd-wrap .my-tab-menu-wrap .my-od-tab .my-od-tab-list a", function(){
		var tabNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_하단탭", "탭_"+tabNm);
	});
	$(document).on("click", ".myhd .my-hd-wrap .my-tab-menu-wrap .my-panel .my-tab-info-content .my-od-info", function(){
		var tabNm = $(this).text().replace(/\s/g, "");
		if($(this).parnets(".my-panel").attr("id") == "tab__myhd-tab--1"){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_하단탭_내주문", tabNm);
		} else if($(this).parnets(".my-panel").attr("id") == "tab__myhd-tab--2"){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_하단탭_지갑", tabNm);
		} else if($(this).parnets(".my-panel").attr("id") == "tab__myhd-tab--3"){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_하단탭_활동", tabNm);
		} else if($(this).parnets(".my-panel").attr("id") == "tab__myhd-tab--4"){
			GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_하단탭_정보", tabNm);
		}
	});
	$(document).on("click", ".myhd .my-hd-wrap .hd-help-wrap .hd-help--wrap a", function(){
		var btnNm = $(this).find("p").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_마이현대", "마이현대", "마이현대_고객센터", btnNm);
	});

	// 마이현대 메뉴 (2023-10-17 리뉴얼)
	$(document).on("click", ".header .header_top .depth_menu > a", function () {
		var menuNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_마이현대_주문내역", "마이현대", "마이현대_메뉴", "메뉴_" + menuNm);
	});
	
	// 1). 주문내역
	$(document).on("click", ".od .wrap-order-history .tab-order-history > li", function(){
		if ($(this).attr("id") == "onlnOrder"){
			GA_Event("click_MO_중문_마이현대_주문내역", "주문내역", "주문내역_탭" , "탭_온라인주문내역");
		} else if ($(this).attr("id") == "oflnOrder"){
			GA_Event("click_MO_중문_마이현대_주문내역", "주문내역", "주문내역_탭" , "탭_오프라인주문내역");
		}
	});
	$(document).on("click", ".od .wrap-input-choice .btn_option_group label input", function(){
		var optNm = $(this).siblings(".txt-label").text().replace(/\s/g, "");
		if ($(".wrap-order-history .tab-order-history > li.is-active").attr("id") == "onlnOrder"){
			GA_Event("click_MO_중문_마이현대_주문내역", "주문내역_탭_온라인주문내역", "주문내역_탭_온라인주문내역_보기옵션" , "보기옵션_"+optNm);
		} else if ($(".wrap-order-history .tab-order-history > li.is-active").attr("id") == "oflnOrder"){
			GA_Event("click_MO_중문_마이현대_주문내역", "주문내역_탭_오프라인주문내역", "주문내역_탭_오프라인주문내역_보기옵션" , "보기옵션_"+optNm);
		}
	});
	$(document).on("click", ".od .tab_contian .order_list .order_goods_tit .order_num", function(){
		var prodNum = $(this).find("span").text().replace(/\s/g, "");
		if ($(".wrap-order-history .tab-order-history > li.is-active").attr("id") == "onlnOrder"){
			GA_Event("click_MO_중문_마이현대_주문내역", "주문내역_탭_온라인주문내역", "주문내역_탭_온라인주문내역_주문상세" , "주문상세_"+prodNum);
		} else if ($(".wrap-order-history .tab-order-history > li.is-active").attr("id") == "oflnOrder"){
			GA_Event("click_MO_중문_마이현대_주문내역", "주문내역_탭_오프라인주문내역", "주문내역_탭_오프라인주문내역_주문상세" , "주문상세_"+prodNum);
		}
	});

	// 2). 공구특가
	if ($("body").find(".container.myhyundai_hshare").length) {
		$(document).on("click", ".container.myhyundai_hshare .my_wrap .myhd_special .cat_tit .cat_total a", function () {
			var prdName = $(this).parents(".cat_tit").find(".cat_tit_area strong em").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_마이현대_공구특가", "공구특가", "공구특가_상품", "상품_" + prdName);
		});

		$(document).on("click", ".container.myhyundai_hshare .my_wrap .myhd_special .cat_tit .mgts button", function () {
			var btnNm = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_마이현대_공구특가", "공구특가", "공구특가_탭_공구특가", btnNm);
		});
	};

	// 3). 적립금내역
	if ($("body").find(".container.myhyundai_mileage").length) {
		$(document).on("click", ".container.myhyundai_mileage .pd_wrap .category_list .cat_tit:first-of-type .cat_arrow", function () {
			if ($(this).hasClass("active") == true) {
				GA_Event("click_MO_중문_마이현대_적립금내역", "적립금내역", "적립금내역_사용가능적립금", "펼치기");
			} else {
				GA_Event("click_MO_중문_마이현대_적립금내역", "적립금내역", "적립금내역_사용가능적립금", "접기");
			};
		});
		$(document).on("click", ".container.myhyundai_mileage .pd_wrap .category_list .cat_tit:nth-of-type(2) .cat_arrow", function () {
			if ($(this).hasClass("active") == true) {
				GA_Event("click_MO_중문_마이현대_적립금내역", "적립금내역", "적립금내역_금일소멸예정적립금", "펼치기");
			} else {
				GA_Event("click_MO_중문_마이현대_적립금내역", "적립금내역", "적립금내역_금일소멸예정적립금", "접기");
			};
		});

		$(document).on("click", ".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item a", function () {
			if ($(this).attr("onclick") == "fn_changeTab('NORMAL')") {
				GA_Event("click_MO_중문_마이현대_적립금내역", "적립금내역", "적립금내역_탭", "탭_일반");
			} else if ($(this).attr("onclick") == "fn_changeTab('EVENPLS')") {
				GA_Event("click_MO_중문_마이현대_적립금내역", "적립금내역", "적립금내역_탭", "탭_추가적립금");
			} else if ($(this).attr("onclick") == "fn_changeTab('BRANPLS')") {
				GA_Event("click_MO_중문_마이현대_적립금내역", "적립금내역", "적립금내역_탭", "탭_브랜드적립금");
			} else if ($(this).attr("onclick") == "fn_changeTab('PTNSPLS')") {
				GA_Event("click_MO_중문_마이현대_적립금내역", "적립금내역", "적립금내역_탭", "탭_제휴플러스");
			} else if ($(this).attr("onclick") == "fn_changeTab('PAYMENT')") {
				GA_Event("click_MO_중문_마이현대_적립금내역", "적립금내역", "적립금내역_탭", "탭_결제플러스");
			};
		});

		$(document).on("click", ".container.myhyundai_mileage .my_wrap #searchForm .order_filter .fom_list .chk_item_list .chk_item label", function () {
			var tar, searchMonth;
			if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('NORMAL')") {
				tar = "기본";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('EVENPLS')") {
				tar = "추가적립금";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('BRANPLS')") {
				tar = "브랜드적립금";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('PTNSPLS')") {
				tar = "제휴플러스";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('PAYMENT')") {
				tar = "결제플러스";
			};

			if ($(this).attr("for") == "radio1") {
				searchMonth = "1개월";
			} else if ($(this).attr("for") == "radio2") {
				searchMonth = "3개월";
			} else if ($(this).attr("for") == "radio3") {
				searchMonth = "6개월";
			} else if ($(this).attr("for") == "radio4") {
				searchMonth = "12개월";
			};
			GA_Event("click_MO_중문_마이현대_적립금내역", "적립금내역_탭_" + tar, "적립금내역_탭_" + tar + "_날짜", "날짜_" + searchMonth);
		});

		$(document).on("click", ".container.myhyundai_mileage .my_wrap #searchForm .fom_list .btn_group > a", function () {
			var tar, stDt, endDt, reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
			if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('NORMAL')") {
				tar = "기본";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('EVENPLS')") {
				tar = "추가적립금";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('BRANPLS')") {
				tar = "브랜드적립금";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('PTNSPLS')") {
				tar = "제휴플러스";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('PAYMENT')") {
				tar = "결제플러스";
			};
			stDt = $(".container.myhyundai_mileage .my_wrap #searchForm .fom_list").find("#stDt").val().replace(reg, "");
			endDt = $(".container.myhyundai_mileage .my_wrap #searchForm .fom_list").find("#endDt").val().replace(reg, "");
			GA_Event("click_MO_중문_마이현대_적립금내역", "적립금내역_탭_" + tar, "적립금내역_탭_" + tar + "_검색날짜", "검색날짜_" + stDt + "-" + endDt);
		});

		$(document).on("change", ".container.myhyundai_mileage .prd_sort #svmtUseCd", function () {
			var tar, txt, val = $(this).val();
			if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('NORMAL')") {
				tar = "기본";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('EVENPLS')") {
				tar = "추가적립금";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('BRANPLS')") {
				tar = "브랜드적립금";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('PTNSPLS')") {
				tar = "제휴플러스";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('PAYMENT')") {
				tar = "결제플러스";
			};

			if (val == "ALL") {
				txt = "전체";
			} else if (val == "002") {
				txt = "적립";
			} else if (val == "001") {
				txt = "사용";
			} else if (val == "") {
				txt = "사용구분";
			};

			GA_Event("click_MO_중문_마이현대_적립금내역", "적립금내역_탭_" + tar, "적립금내역_탭_" + tar + "_정렬기준", "정렬기준_사용구분_" + txt);
		});

		$(document).on("click", ".container.myhyundai_mileage .pd_wrap2 .cat_tit .cat_arrow", function () {
			var tar;
			if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('NORMAL')") {
				tar = "기본";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('EVENPLS')") {
				tar = "추가적립금";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('BRANPLS')") {
				tar = "브랜드적립금";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('PTNSPLS')") {
				tar = "제휴플러스";
			} else if ($(".container.myhyundai_mileage .my_wrap .nav_section .section_tab .tab_item.is_selected").children("a").attr("onclick") == "fn_changeTab('PAYMENT')") {
				tar = "결제플러스";
			};

			if ($(this).hasClass("active") == true) {
				GA_Event("click_MO_중문_마이현대_적립금내역", "적립금내역_탭_" + tar, "적립금내역_탭_" + tar + "_상세", "펼치기");
			} else {
				GA_Event("click_MO_중문_마이현대_적립금내역", "적립금내역_탭_" + tar, "적립금내역_탭_" + tar + "_상세", "접기");
			};
		});
	};

	// 4). 쿠폰내역
	if ($("body").find(".container.myhyundai_coupons").length) {
		$(document).on("click", ".container.myhyundai_coupons #tab1 .pd_wrap .category_list .cat_tit .cat_arrow", function () {
			var tar = $(this).parents(".cat_tit").find(".cat_tit_area strong").text().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/gi, "").replace(/\s/g, '');
			if ($(this).hasClass("active") == true) {
				GA_Event("click_MO_중문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_" + tar, "펼치기");
			} else {
				GA_Event("click_MO_중문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_" + tar, "접기");
			};
		});

		$(document).on("click", ".container.myhyundai_coupons #tab1 #cupForm .chk_price .chk_item label", function () {
			var searchMonth;
			if ($(this).attr("for") == "radio1") {
				searchMonth = "1개월";
			} else if ($(this).attr("for") == "radio2") {
				searchMonth = "3개월";
			} else if ($(this).attr("for") == "radio3") {
				searchMonth = "6개월";
			} else if ($(this).attr("for") == "radio4") {
				searchMonth = "12개월";
			};
			GA_Event("click_MO_중문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_날짜", "날짜_" + searchMonth);
		});

		$(document).on("click", ".container.myhyundai_coupons #tab1 #cupForm .btn_group a", function () {
			if ($(this).attr("onclick") == "fnValidation();") {
				var stDt, endDt, reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
				stDt = $(".container.myhyundai_coupons #tab1 #cupForm .form_box").find("#stDt").val().replace(reg, "");
				endDt = $(".container.myhyundai_coupons #tab1 #cupForm .form_box").find("#endDt").val().replace(reg, "");
				GA_Event("click_MO_중문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_검색날짜", "검색날짜_" + stDt + "-" + endDt);
			};
		});

		$(document).on("change", ".container.myhyundai_coupons #tab1 #cupForm .prd_list_top .prd_sort .sel select", function () {
			var txt, val = $(this).val();
			if ($(this).is("#siteChlCd") == true) {
				if (val == "ALL") {
					txt = "전체";
				} else if (val == "PC") {
					txt = "PC";
				} else if (val == "MO") {
					txt = "모바일웹";
				} else if (val == "AP") {
					txt = "APP";
				} else if (val == "") {
					txt = "채널구분";
				};
				GA_Event("click_MO_중문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_정렬기준", "정렬기준_채널구분_" + txt);
			} else if ($(this).is("#useCls") == true) {
				if (val == "A") {
					txt = "전체";
				} else if (val == "N") {
					txt = "미사용";
				} else if (val == "Y") {
					txt = "사용";
				} else if (val == "E") {
					txt = "기간만료";
				} else if (val == "") {
					txt = "사용구분";
				};
				GA_Event("click_MO_중문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_정렬기준", "정렬기준_사용구분_" + txt);
			};
		});

		$(document).on("click", ".container.myhyundai_coupons #tab1 .pd_wrap2 #cupListArea .cat_tit .cat_arrow", function () {
			if ($(this).hasClass("active") == true) {
				GA_Event("click_MO_중문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_상세", "펼치기");
			} else {
				GA_Event("click_MO_중문_마이현대_쿠폰내역", "쿠폰내역_탭_쿠폰내역", "쿠폰내역_탭_쿠폰내역_상세", "접기");
			};
		});
	};

	// 5). 예치금 / 선수금 / 상품권전환금
	if ($("body").find(".container.myhyundai_cashpoints").length) {
		$(".container.myhyundai_cashpoints .my_wrap .tab_default .wid33p a").on("click", function () {
			if ($(this).parent().is("#CDPST") == true) {
				GA_Event("click_MO_중문_마이현대_예치금상품권전환금", "예치금상품권전환금", "예치금상품권전환금_탭", "탭_예치금");
			} else if ($(this).parent().is("#ADVS") == true) {
				GA_Event("click_MO_중문_마이현대_예치금상품권전환금", "예치금상품권전환금", "예치금상품권전환금_탭", "탭_선수금");
			} else if ($(this).parent().is("#GFCA") == true) {
				GA_Event("click_MO_중문_마이현대_예치금상품권전환금", "예치금상품권전환금", "예치금상품권전환금_탭", "탭_상품권전환금");
			};
		});

		$(document).on("click", ".container.myhyundai_cashpoints .my_wrap #searchListDiv .tab_con_item > .pd_wrap .form_area .btn_group a.btn_w", function () {
			if ($('.container.myhyundai_cashpoints .my_wrap .tab_default .wid33p.is_active').is("#GFCA") == false) {
				if ($('.container.myhyundai_cashpoints .my_wrap .tab_default .wid33p.is_active').is("#CDPST") == true) {
					GA_Event("click_MO_중문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_예치금", "예치금상품권전환금_탭_예치금", "츨금신청");
				} else if ($('.container.myhyundai_cashpoints .my_wrap .tab_default .wid33p.is_active').is("#ADVS") == true) {
					GA_Event("click_MO_중문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_선수금", "예치금상품권전환금_탭_선수금", "츨금신청");
				};
			};
		});

		$(document).on("click", ".container.myhyundai_cashpoints .my_wrap #searchListDiv .tab_con_item #searchForm .order_filter .fom_list ul li:first-of-type .chk_price label", function () {
			var tar01, tar02;

			if ($('.container.myhyundai_cashpoints .my_wrap .tab_default .wid33p.is_active').is("#CDPST") == true) {
				tar01 = "예치금";
			} else if ($('.container.myhyundai_cashpoints .my_wrap .tab_default .wid33p.is_active').is("#ADVS") == true) {
				tar01 = "선수금";
			} else if ($('.container.myhyundai_cashpoints .my_wrap .tab_default .wid33p.is_active').is("#GFCA") == true) {
				tar01 = "상품권전환금";
			};

			if ($(this).attr("for") == "radio1") {
				tar02 = "1개월"
			} else if ($(this).attr("for") == "radio2") {
				tar02 = "3개월"
			} else if ($(this).attr("for") == "radio3") {
				tar02 = "6개월"
			} else if ($(this).attr("for") == "radio4") {
				tar02 = "12개월"
			};

			GA_Event("click_MO_중문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_" + tar01, "예치금상품권전환금_탭_" + tar01 + "_날짜", "날짜_" + tar02);
		});

		$(document).on("click", ".container.myhyundai_cashpoints .my_wrap #searchListDiv .tab_con_item #searchForm .order_filter .fom_list ul li:last-of-type .btn_group a.btn_b", function () {
			if ($(this).attr("onclick") == "fnValidation();") {
				var tar, stDt, endDt, reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
				if ($('.container.myhyundai_cashpoints .my_wrap .tab_default .wid33p.is_active').is("#CDPST") == true) {
					tar = "예치금";
				} else if ($('.container.myhyundai_cashpoints .my_wrap .tab_default .wid33p.is_active').is("#ADVS") == true) {
					tar = "선수금";
				} else if ($('.container.myhyundai_cashpoints .my_wrap .tab_default .wid33p.is_active').is("#GFCA") == true) {
					tar = "상품권전환금";
				};
				stDt = $(".container.myhyundai_cashpoints .my_wrap #searchListDiv .tab_con_item #searchForm .order_filter .fom_list ul li:last-of-type .form_box").find("#stDt").val().replace(reg, "");
				endDt = $(".container.myhyundai_cashpoints .my_wrap #searchListDiv .tab_con_item #searchForm .order_filter .fom_list ul li:last-of-type .form_box").find("#endDt").val().replace(reg, "");
				GA_Event("click_MO_중문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_" + tar, "예치금상품권전환금_탭_" + tar + "_검색날짜", "검색날짜_" + stDt + "-" + endDt);
			};
		});

		$(document).on("change", ".container.myhyundai_cashpoints .my_wrap #searchListDiv .tab_con_item #searchForm > .pd_wrap .my_total_wrap #useStat", function () {
			var tar, txt, val = $(this).val();
			if ($('.container.myhyundai_cashpoints .my_wrap .tab_default .wid33p.is_active').is("#CDPST") == true) {
				tar = "예치금";
			} else if ($('.container.myhyundai_cashpoints .my_wrap .tab_default .wid33p.is_active').is("#ADVS") == true) {
				tar = "선수금";
			} else if ($('.container.myhyundai_cashpoints .my_wrap .tab_default .wid33p.is_active').is("#GFCA") == true) {
				tar = "상품권전환금";
			};

			if (val == "ALL") {
				txt = "전체";
			} else if (val == "SAVE") {
				txt = "적립";
			} else if (val == "USE") {
				txt = "사용";
			} else if (val == "") {
				txt = "사용구분";
			};

			GA_Event("click_MO_중문_마이현대_예치금상품권전환금", "예치금상품권전환금_탭_" + tar, "예치금상품권전환금_탭_" + tar + "_정렬기준", "정렬기준_사용구분_" + txt);
		});
	};

	// 6). 관심 상품 / 브랜드
	if ($("body").find(".container.myhyundai_interestproducts").length) {
		$(".container.myhyundai_interestproducts .my_wrap .tab_default #listCnrBran a").on("click", function () {
			GA_Event("click_MO_중문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭", "탭_관심브랜드");
		});

		$(document).on("click", ".container.myhyundai_interestproducts .my_wrap .tab_con_box .prd_list_new .listArea .goosList.item .bull_like_area3 a.bull_like3.on", function () {
			GA_Event("click_MO_중문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭_관심상품", "관심취소");
		});

		$(document).on("click", ".container.myhyundai_interestproducts .my_wrap .tab_con_box .prd_list_new .listArea .goosList.item input+a", function () {
			var prdName = $(this).parent().find(".prd_tit2 a .goosNm").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭_관심상품", "상품_" + prdName);
		});
		$(document).on("click", ".container.myhyundai_interestproducts .my_wrap .tab_con_box .prd_list_new .listArea .goosList.item .prd_tit2 a", function () {
			var prdName = $(this).find(".goosNm").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭_관심상품", "상품_" + prdName);
		});

		$(document).on("click", ".container.myhyundai_interestproducts .my_wrap .tab_con_box .prd_list_new .listArea .goosList.item .cart a", function () {
			GA_Event("click_MO_중문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭_관심상품", "장바구니담기");
		});

		$(document).on("click", ".container.myhyundai_interestproducts .my_wrap .tab_con_box .prd_list_new .listArea .goosList.item a.no_stoc", function () {
			GA_Event("click_MO_중문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭_관심상품", "재입고알림");
		});

		$(document).on("click", ".container.myhyundai_interestproducts .my_wrap .tab_con_box .prd_list_new .listArea .goosList.item .checkbox_dimm label", function () {
			var prdName = $(this).parents(".goosList.item").find(".prd_tit2 a .goosNm").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭_관심상품_한번에 담기_상품", "상품_" + prdName);
		});
	};
	if ($("body").find(".container.myhyundai_interestbrands").length) {
		$(".container.myhyundai_interestbrands .my_wrap .tab_default #listCnrGoos a").on("click", function () {
			GA_Event("click_MO_중문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭", "탭_관심상품");
		});

		$(document).on("click", ".container.myhyundai_interestbrands .my_wrap .tab_con_box .prd_list_new .branListArea > li > a", function () {
			var brandName = $(this).find(".brand_name").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_마이현대_관심상품브랜드", "관심상품브랜드", "관심상품브랜드_탭_관심브랜드", "브랜드_" + brandName);
		});
	};

	// 7). 상품평
	if ($("body").find(".container.myhyundai_reviews").length) {
		$(".container.myhyundai_reviews .tab_type1 li a").on("click", function () {
			if ($(this).attr("title") == "commentArea01") {
				GA_Event("click_MO_중문_마이현대_상품평", "상품평", "상품평_탭", "탭_작성완료상품");
			} else if ($(this).attr("title") == "commentArea02") {
				GA_Event("click_MO_중문_마이현대_상품평", "상품평", "상품평_탭", "탭_미작성상품");
			};
		});

		$(document).on("click", ".container.myhyundai_reviews #commentArea01 .review_list > ul > li > .review_cont .btn_wrap button", function () {
			if ($(this).attr("onclick").includes("delGrvws") == true) {
				GA_Event("click_MO_중문_마이현대_상품평", "상품평", "상품평_텝_작성완료상품", "삭제");
			} else if ($(this).attr("onclick").includes("showEdtGoosGrvwsFormLayer") == true) {
				GA_Event("click_MO_중문_마이현대_상품평", "상품평", "상품평_텝_작성완료상품", "수정");
			};
		});
	};

	// 8). 기본정보관리
	if ($("body").find(".container.myhyundai_basicinfo").length) {
		$(".container.myhyundai_basicinfo #frmDetailBaseInfoMnge .tb_write #receiving_marketing .form_box .checkbox label").on("click", function () {
			var txt;
			if ($(this).attr("for") == "agrYn") {
				txt = "마케팅이용정보동의";
			} else if ($(this).attr("for") == "smsRcvYn") {
				txt = "SMS";
			} else if ($(this).attr("for") == "mailRcvYn") {
				txt = "이메일";
			};

			GA_Event("click_MO_중문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_마케팅정보수신동의", "마케팅정보수신동의_" + txt);
		});

		$(".container.myhyundai_basicinfo #frmDetailBaseInfoMnge .tb_write #personal_information .form_box .radio").on("click", function () {
			var txt;
			if ($(this).find("label").attr("for") == "expiration_day01") {
				txt = "1년";
			} else if ($(this).find("label").attr("for") == "expiration_day02") {
				txt = "3년";
			} else if ($(this).find("label").attr("for") == "expiration_day03") {
				txt = "4년";
			} else if ($(this).find("label").attr("for") == "expiration_day04") {
				txt = "탈퇴시파기";
			};

			GA_Event("click_MO_중문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_개인정보유효기간", "개인정보유효기간_" + txt);
		});

		$(".container.myhyundai_basicinfo #frmDetailBaseInfoMnge .tb_write tr .form_box #btnChgUmbMbsh").on("click", function () {
			GA_Event("click_MO_중문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_회원구분", "H.Point통합회원전환");
		});

		$(".container.myhyundai_basicinfo #frmDetailBaseInfoMnge .tb_write tr #btnMbshWithdrawal").on("click", function () {
			GA_Event("click_MO_중문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_회원탈퇴", "회원탈퇴");
		});
	};
	if ($("body").find(".container.myhyundai_withdrawal").length) {
		$(".container.myhyundai_withdrawal #frmMbshWithdrawal .small_form #widrResnCd").on("change", function () {
			var txt, val = $(this).val();

			if (val == "01") {
				txt = "상품다양성/가격/품질 불만";
			} else if (val == "02") {
				txt = "상품선택/주문 등 사용이 어려움";
			} else if (val == "03") {
				txt = "회원혜택/쇼핑혜택 부족";
			} else if (val == "04") {
				txt = "인도장 상품인도 불만";
			} else if (val == "05") {
				txt = "시스템에러/속도 등 불만";
			} else if (val == "06") {
				txt = "개인정보 유출 우려";
			} else if (val == "07") {
				txt = "주문취소/반품/AS 불만";
			} else if (val == "08") {
				txt = "자주 이용하지 않음";
			} else if (val == "09") {
				txt = "기타";
			} else if (val == "") {
				txt = "탈퇴사유 선택";
			};

			GA_Event("click_MO_중문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_회원탈퇴사유", "회원탈퇴사유_" + txt.replace(/\s/g, ''));
		});

		$(".container.myhyundai_withdrawal #frmMbshWithdrawal .btn_box .col button").on("click", function () {
			if ($(this).is("#btnCancel") == true) {
				GA_Event("click_MO_중문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_회원탈퇴", "취소");
			} else if ($(this).is("#btnConfirm") == true) {
				GA_Event("click_MO_중문_마이현대_기본정보관리", "기본정보관리", "기본정보관리_회원탈퇴", "탈퇴신청");
			};
		});
	};
	/* 마이현대 End */

	/* S: 3차 개선건 GA4 20231212 */
	/* 마이현대 스페셜오더 Start */
	// 스페셜오더 검색
	$(document).on("click", ".specialOrder .special-order .special-order-comment-wrap .special-order-comment-link", function () {
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더", "스페셜오더", "스페셜오더신청내역확인");
	});
	$(document).on("click", ".specialOrder .special-order .special-order-info-search .saerch-top button[onclick='fnSrchSpordBran();']", function () {
		var srchTxt = $(this).parents(".saerch-top").find("input").val().replace(/\s/g, '');
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더", "스페셜오더_검색", "검색어_"+srchTxt);
	});
	$(document).on("click", ".specialOrder .special-order .special-order-info-search .search-tab-contents .hot-brand-emotion ul li a", function () {
		var branNm = $(this).find("p").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더", "스페셜오더_검색", "HOT브랜드_"+branNm);
	});
	$(document).on("click", ".specialOrder .special-order .special-order-info-search .brand-category-wrap .brand-category ul li button", function () {
		var cateNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더", "스페셜오더_검색", "카테고리_"+cateNm);
	});
	$(document).on("click", ".specialOrder .special-order .special-order-info-search .brand-category-wrap .kr-en-conversion-wrap .kr-en-conversion button", function () {
		if ($(this).attr("onclick") == "fnShowInital(this, 'han');") {
			GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더", "스페셜오더_검색", "정렬_가나다순");
		} else if ($(this).attr("onclick") == "fnShowInital(this, 'eng');") {
			GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더", "스페셜오더_검색", "정렬_ABC순");
		}
	});
	$(document).on("click", ".specialOrder .special-order .special-order-info-search .brand-category-wrap .kr-en-conversion-wrap .initial-sound ul li button", function () {
		var btnNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더", "스페셜오더_검색", "정렬기준_"+btnNm);
	});
	$(document).on("click", ".specialOrder .special-order .special-order-info-search .brand-category-wrap .brand-accordion-wrap .wrap-accordion .accordion__tit button", function () {
		var btnNm = $(this).siblings(".kr-conversion-data").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더", "스페셜오더_검색", "정렬기준_"+btnNm);
	});
	$(document).on("click", ".specialOrder .special-order .special-order-info-search .brand-category-wrap .brand-accordion-wrap .wrap-accordion .accordion__cont ul li", function () {
		var branNm = $(this).find("p:nth-of-type(1)").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더", "스페셜오더_검색", "브랜드_"+branNm);
	});

	// 스페셜오더 검색결과없음
	$(document).on("click", ".specialOrder .special-order .special-order-info-search .wrap-list-cart .list-product__searchlist li a", function () {
		var branNm = $(this).parents(".product__item").find(".brand").text().replace(/\s/g, ""),
			goosNm = $(this).parents(".product__item").find(".brand_ex").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_검색결과없음", "스페셜오더_검색결과없음", "상품_"+branNm+"_"+goosNm);
	});
	$(document).on("click", ".specialOrder .special-order .special-order-info-search .wrap-list-cart .list-product__searchlist li .cart a", function(){
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_검색결과없음", "스페셜오더_검색결과없음", "장바구니담기");
	});

	// 스페셜오더 상품신청
	$(document).on("click", "#spordRqmtPop .specialOrder .special-order-product-apply .special-order-flex button[onclick='fnCloseSpordRqmtPop();']", function () {
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_브랜드", "변경");
	});
	$(document).on("click", "#spordRqmtPop .specialOrder .special-order-product-apply .special-order-flex button[onclick='fnSrchSpordGoos();']", function () {
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_상품코드", "검색");
	});
	if ($('body').find(".specialOrder").length) {
		$(document).on("click", ".wrap-list-dropdown .list-dropdown[data-parentid='storCdGoo'] li button", function(){
			var optNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_지점선택", "지점_"+optNm);
		});
	}
	$(document).on("click", "#spordRqmtPop .specialOrder .quantity-choice-wrap .wrap-option-change .option-change__num input[type='button']", function () {
		var qtyVal = $(this).val();
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_수량조절", qtyVal);
	});
	$(document).on("click", "#spordRqmtPop .float_btn button", function () {
		if ($(this).attr("onclick") == "fnCloseSpordRqmtPop();") {
			GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청", "취소");
		} else if ($(this).attr("onclick") == "fnMoveSpordForm();") {
			GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청", "상품신청");
		}
	});
	// 스페셜오더 상품신청 팝업
	$(document).on("click", ".specialOrder .special-order-product-popup_02 .inquiry-product-info-area button[onclick='fnMoveSpordMain();']", function () {
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_주문상품정보", "상품변경");
	});
	if ($('body').find(".specialOrder").length) {
		$(document).on("click", ".wrap-list-dropdown .list-dropdown[data-parentid='telNatiCd'] li button", function(){
			var optNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_주문자정보", "국적_"+optNm);
		});
	}
	$(document).on("click", ".specialOrder .special-order-product-popup_02 .departure-info-area button[onclick='openDpatAirInfoList()']", function () {
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_출국정보입력", "출국정보불러오기");
	});
	if ($('body').find(".specialOrder").length) {
		$(document).on("click", ".wrap-list-dropdown .list-dropdown[data-parentid='orderDpatPlacCd'] li button", function(){
			var optNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_출국정보입력", "출국장소_"+optNm);
		});
		$(document).on("click", ".wrap-calendar .wrap-calendar__inner > button.btn-square", function () {
			var optNm = $(".specialOrder .special-order-product-popup_02 .departure-info-area .order-user-area .order-departure-date input[name='spordDpatDt']").val().replace(/\s/g, '');
			GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_출국정보입력", "출국일_"+optNm);
		});
		$(document).on("click", ".wrap-list-dropdown .list-dropdown[data-parentid='dpatTm'] li button", function(){
			var optNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_출국정보입력", "출국시간_"+optNm);
		});
	}
	$(document).on("click", ".specialOrder .special-order-product-popup_02 .departure-info-area .order-user-area.order-direct-transit .order-direct-transit-area input[name='drtaYn'] + label", function(){
		if ($(this).attr("for") == "drtaYn1") {
			GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_출국정보입력", "직항");
		} else if ($(this).attr("for") == "drtaYn2") {
			GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_출국정보입력", "경유");
		}
	});
	if ($('body').find(".specialOrder").length) {
		$(document).on("click", ".wrap-list-dropdown .list-dropdown[data-parentid='viaAreaCd'] li button", function(){
			var optNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_출국정보입력", "경유지_"+optNm);
		});
	}
	$(document).on("click", ".specialOrder .special-order-product-popup_02 .departure-info-area .order-user-area .special-order-flex button[onclick='openPopSrchOpenNm()']", function () {
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_출국정보입력", "항공사/편명_검색");
	});
	$(document).on("click", ".specialOrder .wrap-accordion.special-order-area-attention .accordion__tit button", function () {
		if ($(this).parents(".wrap-accordion").find(".accordion__cont").hasClass("is-active") == true) {
			GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_출국정보입력", "유의사항닫힘");
		} else {
			GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_출국정보입력", "유의사항펼침");
		}
	});
	$(document).on("click", ".specialOrder .special-order-product-popup_02 .departure-info-area .btn-wrap button[onclick='saveSpord()']", function () {
		GA_Event("click_MO_중문_마이현대_스페셜오더", "스페셜오더_상품신청", "스페셜오더_상품신청_출국정보입력", "스페셜오더신청");
	});
	/* 마이현대 스페셜오더 End */
	/* E: 3차 개선건 GA4 20231212 */

	/* 고객센터 Start */
	/* S : 2024-11-11 고객센터 메인 개선 */
	// 1). 고객센터 메인
	$(document).on("click", ".wrap_customer .faq_sh form[name='searchForm'] #searchBtn", function(){
		var faqSrch =  $(this).parents("form[name='searchForm']").find("input[id='faqsh']").val().replace(/\s/g, "");
		GA_Event("click_MO_중문_고객센터", "FAQ", "FAQ_검색", "검색어_"+faqSrch);
	});

	$(document).on("click", ".wrap_customer .faq_top10 .faq_list li a", function(){
		var faqNm = $(this).contents().not($(this).children("i")).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_고객센터", "FAQ", "FAQ_TOP10", faqNm);
	});

	$(document).on("click", ".wrap_customer .customer_top .faq_top10 .faq_more", function () {
		GA_Event("click_MO_중문_고객센터", "FAQ", "FAQ", "전체보기");
	});

	$(document).on("click", ".wrap_customer .customer_top .faq_inquiry .btn_inquiry", function () {
		GA_Event("click_MO_중문_고객센터", "FAQ", "FAQ_1:1문의", "회원문의하기");
	});

	$(document).on("click", ".wrap_customer .customer_nav li a", function () {
		var custMenu = $(this).text().replace(/\s/g, '');
		GA_Event("click_MO_중문_고객센터", "안내", "안내", custMenu);
	});

	$(document).on("click", ".wrap_customer .customer_noti .noti_list .noti_more", function () {
		GA_Event("click_MO_중문_고객센터", "공지사항", "공지사항", "더보기");
	});

	$(document).on("click", ".wrap_customer .customer_noti .noti_list ul li a", function () {
		var custNoti = $(this).text().replace(/\s/g, '');
		GA_Event("click_MO_중문_고객센터", "공지사항", "공지사항_상세", custNoti);
	});

	$(document).on("click", ".wrap_customer .customer_noti .noti_evnt .noti_more", function () {
		GA_Event("click_MO_중문_고객센터", "당첨자발표", "당첨자발표", "더보기");
	});

	$(document).on("click", ".wrap_customer .customer_noti .noti_evnt ul li a", function () {
		var custEvnt = $(this).text().replace(/\s/g, '');
		GA_Event("click_MO_중문_고객센터", "당첨자발표", "당첨자발표_상세", custEvnt);
	});
	/* E : 2024-11-11 고객센터 메인 개선 */

	// 2). FAQ
	if ($(".container").find("#faqCtgId").length) {
		$(document).on("click", ".container .nav_section.type1.mg_minus2 #nav_tab .section_tab .tab_item a", function () {
			var tabName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_고객센터_FAQ", "FAQ", "FAQ_탭", "탭_" + tabName);
		});

		$(document).on("click", ".container .accordion_list.inquiry.faq .listArea dt a", function () {
			var tabName = $(".container .nav_section.type1.mg_minus2 #nav_tab .section_tab .tab_item.is_selected").text().replace(/\s/g, ''), faqName = $(this).find(".tit").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_고객센터_FAQ", "FAQ", "FAQ_탭_" + tabName + "_질문", faqName);
		});

		$(document).on("click", ".container .txt_with_btn.mgtm a", function () {
			GA_Event("click_MO_중문_고객센터_FAQ", "FAQ", "FAQ_메뉴", "1:1상담문의");
		});
	};
	/* 고객센터 End */

	/* S: 3차 개선건 GA4 20231212 */
	/* 검색 Start */
	/*$(document).on("click", ".searchLayer .productSaerchList .saerch-top button[onclick='javascript:searchHeaderAction();']", function () {
		if ($(this).parents(".saerch-top").hasClass("type-hash") == true) {
			var srchHash = $(this).parents(".saerch-top").find("input[id='hashSearchTerm']").val().replace(/\s/g, "");
			GA_Event("click_MO_중문_검색", "검색전", "검색전_해시태그검색", "해시태그_"+srchHash);
		} else {
			var srchTxt = $(this).parents(".saerch-top").find("input[id='basicSearchTerm']").val().replace(/\s/g, "");
			GA_Event("click_MO_중문_검색", "검색전", "검색전_일반검색", "검색어_"+srchTxt);
		};
	});*/
	$(document).on("click", ".searchLayer .productSaerchList .saerch-top button[id='srchCond']", function () {
		if ($(this).parents(".saerch-top").hasClass("type-hash") == true) {
			GA_Event("click_MO_중문_검색", "검색전", "검색전_검색유형선택", "해시태그검색");
		} else {
			GA_Event("click_MO_중문_검색", "검색전", "검색전_검색유형선택", "일반검색");
		};
	});
	$(document).on("click", ".searchLayer .productSaerchList .search-tab-menu-wrap #autoList .general-search-wrap .general-search-link a", function () {
		var srchBran = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "자동완성", "자동완성_일반검색_연관검색어", "브랜드_"+srchBran);
	});
	$(document).on("click", ".searchLayer .productSaerchList .search-tab-menu-wrap #autoList .general-search-wrap .sh_multi02 a", function () {
		if ($(this).parents(".sh_multi02").hasClass("sh_type_brands") == true) {
			var srchBran = $(this).find(".default-text").text().replace(/\s/g, "");
			GA_Event("click_MO_중문_검색", "자동완성", "자동완성_일반검색_연관브랜드", "브랜드_"+srchBran);
		} else if ($(this).parents(".sh_multi02").hasClass("sh_type_keywords") == true) {
			var srchTxt = $(this).find(".default-text").text().replace(/\s/g, "");
			GA_Event("click_MO_중문_검색", "자동완성", "자동완성_일반검색_연관검색어", "검색어_"+srchTxt);
		} else if ($(this).parents(".sh_multi02").hasClass("sh_type_hashs") == true) {
			var srchHash = $(this).siblings("input").val().replace(/\s/g, "");
			GA_Event("click_MO_중문_검색", "자동완성", "자동완성_해시태그검색_연관검색어", "검색어_"+srchHash);
		}
	});
	$(document).on("click", ".searchLayer .productSaerchList .search-tab-menu-wrap #searchTab li", function () {
		var tabNm = $(this).parents("#searchTab").find("li.active").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "검색전_탭", "탭_"+tabNm);
	});
	$(document).on("click", ".searchLayer .productSaerchList .search-tab-menu-wrap #searchTotList .hit-search-tab-content #autoSaveTab .search-recent label input[id='toggleAutoSaveSwitch']", function () {
		if ($(this).is(":checked") == true){
			GA_Event("click_MO_중문_검색", "검색전", "검색전_최근검색어", "자동저장켜기");
		} else {
			GA_Event("click_MO_중문_검색", "검색전", "검색전_최근검색어", "자동저장끄기");
		}
	});
	$(document).on("click", ".searchLayer .productSaerchList .search-tab-menu-wrap #searchTotList .hit-search-tab-content #autoSaveTab #rcntKeyword .search-result ul li button.btn-current-choice", function () {
		var srchTxt = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "검색전_최근검색어", "검색어_"+srchTxt);
	});
	$(document).on("click", ".searchLayer .productSaerchList .search-tab-menu-wrap #searchTotList .hit-search-tab-content .search-hit-swiper .search-hit-wrap .search-hit-box ul li", function () {
		var srchTxt = $(this).find(".hit-name").text().replace(/\s/g, "");
		if (srchTxt.indexOf("#") > -1) {
			GA_Event("click_MO_중문_검색", "검색전", "검색전_인기해시태그검색어", "검색어_"+srchTxt);
		} else {
			GA_Event("click_MO_중문_검색", "검색전", "검색전_인기검색어", "검색어_"+srchTxt);
		}
	});
	$(document).on("click", ".searchLayer .productSaerchList .search-tab-menu-wrap #searchTotList .brand-search-tab-content .search-tab-contents .hot-brand-emotion ul li a", function () {
		var branNm = $(this).find("p").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드검색", "HOT브랜드_"+branNm);
	});
	$(document).on("click", ".searchLayer .productSaerchList .search-tab-menu-wrap #searchTotList .brand-search-tab-content .brand-category-wrap .brand-category ul li button", function () {
		var cateNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드검색", "카테고리_"+cateNm);
	});
	$(document).on("click", ".searchLayer .productSaerchList .search-tab-menu-wrap #searchTotList .brand-category-wrap .kr-en-conversion-wrap .kr-en-conversion button", function () {
		if ($(this).attr("data-lang") == "kr") {
			GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드검색", "정렬_가나다순");
		} else if ($(this).attr("data-lang") == "en") {
			GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드검색", "정렬_ABC순");
		}
	});
	$(document).on("click", ".searchLayer .productSaerchList .search-tab-menu-wrap #searchTotList .brand-category-wrap .kr-en-conversion-wrap .initial-sound ul li button", function () {
		var sortNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드검색", "정렬기준_"+sortNm);
	});
	$(document).on("click", ".searchLayer .productSaerchList .search-tab-menu-wrap #searchTotList .brand-category-wrap .brand-accordion-wrap .wrap-accordion .accordion__tit button", function () {
		var sortNm = $(this).siblings(".kr-conversion-data").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드검색", "정렬기준_"+sortNm);
	});
	$(document).on("click", ".searchLayer .productSaerchList .search-tab-menu-wrap #searchTotList .brand-category-wrap .brand-accordion-wrap .wrap-accordion .accordion__cont ul li", function () {
		var branNm = $(this).find("p:nth-of-type(1)").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드검색", "브랜드_"+branNm);
	});
	$(document).on("click", ".searchLayer .productSaerchList .search-interface-wrap > a", function () {
		GA_Event("click_MO_중문_검색", "검색", "검색_설정", "취소");
	});
	// 검색 레이어 하단 - 음성인식, QR코드 기능 오픈 전. 아직 class, id 값 없음. ----> 확인불가
	/* 검색 End */

	/* S: 개선건 GA4 20251015 */
	/* 검색 Start */
	$(document).on("click", ".productSaerchList .product-saerch .search-tab-content .search-recent-wrap .search-recent .toggle-switch-auto-save label input[id='autoSaveBtn']", function () {
		if ($(this).is(":checked") == true){
			GA_Event("click_MO_중문_검색", "검색전", "검색전_최근검색어", "자동저장켜기");
		} else {
			GA_Event("click_MO_중문_검색", "검색전", "검색전_최근검색어", "자동저장끄기");
		}
	});

	$(document).on("click", ".productSaerchList .product-saerch .search-tab-content .search-recent-wrap .search-recent .search-word-button", function () {
		GA_Event("click_MO_중문_검색", "검색전", "검색전_최근검색어", "전체삭제");
	});

	$(document).on("click", ".productSaerchList .product-saerch .search-tab-content .search-word-flex .search-word-button", function () {
		GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드둘러보기", "브랜드 둘러보기");
	});

	$(document).on("click", ".productSaerchList .product-saerch .search-tab-content .hot-brand-emotion a", function () {
		var branNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드둘러보기", "HOT브랜드_"+branNm);
	});

	$(document).on("click", ".productSaerchList .product-saerch .product-recent-list .btn-recent-clear", function () {
		GA_Event("click_MO_중문_검색", "검색전", "검색전_최근 본 상품", "전체삭제");
	});

	$(document).on("click", ".productSaerchList .product-saerch .product-recent-wrap .product-recent-content .product-recent-list .recent-prd a", function () {
		var prdNm = $(this).find('img').attr("alt").replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "검색전_최근 본 상품", "최근본상품_"+prdNm);
	});

	$(document).on("click", ".productSaerchList .product-saerch .product-recent-wrap .product-recent-content .product-recent-list .recent-prd button", function () {
		var prdNm = $(this).parent('.recent-prd').find('a').find('img').attr("alt").replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "최근본상품_"+prdNm, "삭제");
		alert('asd');
	});

	$(document).on("click", ".brandLayer .productSaerchList .product-saerch .saerch-top .btn-history-back", function () {
		GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드둘러보기", "뒤로가기");
	});

	$(document).on("click", ".brand-category-wrap .brand-category-content .brand-category ul li button", function () {
		var cateNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드둘러보기", "카테고리_"+cateNm);
	});

	$(document).on("click", ".brand-category-wrap .brand-category-content .kr-en-conversion-wrap .kr-en-conversion button", function () {
		var btnNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드둘러보기", "정렬_"+btnNm);
	});

	$(document).on("click", ".brand-category-wrap .brand-category-content .kr-en-conversion-wrap .initial-sound ul li button", function () {
		var btnNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드둘러보기", "정렬기준_"+btnNm);
	});

	$(document).on("click", ".wrap-accordion .accordion__tit button", function () {
		var btnNm = $(this).parent('.accordion__tit').find('.kr-conversion-data').text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드둘러보기", "정렬기준_"+btnNm);
	});

	$(document).on("click", ".brand-category-wrap .brand-category-content .brand-accordion-wrap .wrap-accordion .accordion__cont ul li p", function () {
		var prdNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색전", "검색전_브랜드둘러보기", "브랜드_"+prdNm);
	});

	/* 검색 End */

	/* 검색필터 Start */
	$(document).on("click", ".searchFilterPopup .productSaerchList .product-saerch-filter-wrap .product-saerch-filter .filter-benefits-box .filter-round-input-box label input[name='benefitFilter']", function () {
		var filtNm = $(this).val().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색필터", "검색필터_혜택필터", filtNm);
	});
	$(document).on("click", ".searchFilterPopup .productSaerchList .product-saerch-filter-wrap .product-saerch-filter .filter-goods-box .filter-round-input-box label input[name='shopFilter']", function () {
		var filtNm = $(this).val().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색필터", "검색필터_상품유형필터", filtNm);
	});
	$(document).on("click", ".searchFilterPopup .productSaerchList .product-saerch-filter-wrap .product-saerch-filter .filter-category-box .filter-category-input-box label input[name='cateFilter']", function () {
		var filtNm = $(this).val().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색필터", "검색필터_카테고리필터", filtNm);
	});
	$(document).on("click", ".searchFilterPopup .productSaerchList .product-saerch-filter-wrap .product-saerch-filter .filter-category-box .filter-category-result-box .filter-box-check input[name='cateFilter'] + label", function () {
		var filtNm = $(this).parents(".filter-category-result-box").find(".filter-category-result input").val().replace(/\s/g, ""),
			filtNm2 = $(this).prev("input").attr("data-name").replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색필터", "검색필터_카테고리필터", filtNm+"_"+filtNm2);
	});
	$(document).on("click", ".searchFilterPopup .productSaerchList .product-saerch-filter-wrap .product-saerch-filter .filter-accordion-wrap .wrap-accordion .accordion__cont .initial-sound ul li button[data-role='brandbtn']", function () {
		var sortNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색필터", "검색필터_브랜드필터", "정렬기준_"+sortNm);
	});
	$(document).on("click", ".searchFilterPopup .productSaerchList .product-saerch-filter-wrap .product-saerch-filter .filter-accordion-wrap .wrap-accordion .accordion__cont .filter-box-check input[name='branFilter'] + label", function () {
		var branNm = $(this).prev("input").attr("data-name").replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색필터", "검색필터_브랜드필터", "브랜드_"+branNm);
	});
	$(document).on("click", ".searchFilterPopup .productSaerchList .product-saerch-filter-wrap .product-saerch-filter .filter-accordion-wrap .wrap-accordion .accordion__cont .filter-box-check input[name='priceFilter'] + label", function () {
		var filtNm = $(this).prev("input").attr("data-name").replace(/\s/g, "");
		GA_Event("click_MO_중문_검색", "검색필터", "검색필터_가격필터", "가격_"+filtNm);
	});

	var filtSrch = 0;
	$(document).on("change", ".searchFilterPopup .productSaerchList .product-saerch-filter-wrap .product-saerch-filter .filter-accordion-wrap .wrap-accordion .accordion__cont .price-range-data-wrap .price-range-data input", function(){
		filtSrch = 1;
	});
	$(document).on("click", ".searchFilterPopup .productSaerchList .product-saerch-filter-wrap .filter-box-footer .filter-box-function button, .searchFilterPopup .productSaerchList .product-saerch-filter-wrap .filter-box-footer .filter-box-function a", function(){
		if ($(this).attr("onclick") == "goosSearchItemFilter('Y');"){
			if(filtSrch == 1){
				var stPr = $(".price-range-data-wrap .price-range-data input#priceFilterStr").val(),
					endPr = $(".price-range-data-wrap .price-range-data input#priceFilterEnd").val();
				GA_Event("click_MO_중문_검색", "검색필터", "검색필터_가격필터", "가격_"+stPr+"~"+endPr);
			} else {
				GA_Event("click_MO_중문_검색", "검색필터", "검색필터", "검색");
			}
		} else if ($(this).attr("onclick") == "goosSearchItemInit('N');"){
			GA_Event("click_MO_중문_검색", "검색필터", "검색필터", "초기화");
		}
	});
	/* 검색필터 End */

	/* 검색결과 Start */
	// 검색결과 - 상단
	$(document).on("click", ".productSaerchList .product-saerch .search-round-data-wrap .search-round-data ul li button", function () {
		var srchTxt = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색결과", "검색결과", "검색결과_연관검색어", "검색어_"+srchTxt);
	});
	$(document).on("click", ".productSaerchList .product-saerch .search-round-data-wrap .search-round-data-2 ul li button", function () {
		var srchBran = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색결과", "검색결과", "검색결과_브랜드", "브랜드_"+srchBran);
	});
	$(document).on("click", ".productSaerchList .product-saerch .product-saerch-list-top .product-saerch-list-middle .toggle-switch-wrap label input[id='toggleSwitch']", function () {
		if ($(this).is(":checked") == true){
			GA_Event("click_MO_중문_검색결과", "검색결과", "검색결과", "품절_토글on");
		} else {
			GA_Event("click_MO_중문_검색결과", "검색결과", "검색결과", "품절_토글off");
		}
	});
	if ($(".container").find(".productSaerchList").length) {
		$(document).on("click", ".wrap-list-dropdown .list-dropdown[data-parentid='goodsListOrder'] li button", function(){
			var sortNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_검색결과", "검색결과", "검색결과_정렬기준", "정렬기준_"+sortNm);
		});
	}

	// 검색결과 - 상품리스트
	// 1.타입_상품
	$(document).on("click", ".productSaerchList .product-saerch .saerch-result-content #goosArea .goosMoreArea .list-product__searchlist .goosList.item a", function () {
		var branNm = $(this).parents("li").find(".brand").text().replace(/\s/g, ""),
			goosNm = $(this).parents("li").find(".brand_ex").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색결과", "검색결과", "검색결과_상품", "상품_"+branNm+"_"+goosNm);
	});
	$(document).on("click", ".productSaerchList .product-saerch .saerch-result-content #goosArea .goosMoreArea .list-product__searchlist .goosList.item .cart > a", function () {
		GA_Event("click_MO_중문_검색결과", "검색결과", "검색결과_상품", "장바구니담기");
	});
	// 2.타입_이벤트/기획전
	$(document).on("click", ".productSaerchList .product-saerch .saerch-result-content #goosArea .goosMoreArea .list-product__searchlist .ev_box a", function () {
		var bnnrNm = $(this).find(".prd_name").text().replace(/\s/g, ""),
			bnnrNm2 = $(this).find(".prd_th").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색결과", "검색결과", "검색결과_상품", bnnrNm+"_"+bnnrNm2);
	});
	// 타입_브랜드
	$(document).on("click", ".productSaerchList .product-saerch .saerch-result-content #goosArea .goosMoreArea .list-product__searchlist .brend_box a", function () {
		var branNm = $(this).find(".brend_tit").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색결과", "검색결과", "검색결과_상품", "브랜드_"+branNm);
	});
	// 3.타입_럭키딜/타임세일/커밍순/사은행사 ----> 확인불가
	// 4.타입_쿠폰/적립금 ----> 확인불가
	// 5.타입_동영상 ----> 확인불가

	// 검색결과 - 오프라인
	$(document).on("click", ".productSaerchList .product-saerch .saerch-result-content .search-result-offline-shop-wrap .search-result-offline-shop-link a", function () {
		var btnNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색결과", "검색결과_오프라인", "검색결과_오프라인", btnNm);
	});

	// 검색결과 - 인기검색어 영역
	$(document).on("click", ".productSaerchList .product-saerch .saerch-result-content .search-list-hit-content .search-hit-swiper .search-hit-wrap .search-hit-box ul li", function () {
		var srchHash = $(this).find(".hit-name").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색결과", "검색결과", "검색결과_인기#해시태그", "해시태그_"+srchHash);
	});

	// 검색결과 - 추천상품 영역
	$(document).on("click", ".productSaerchList .product-saerch .saerch-result-content .wrap-list-cart[id='groobeeRecommend'] .list-product__recommend[id='groobeeProduct'] li a", function () {
		var branNm = $(this).parents("li").find(".product__brand").text().replace(/\s/g, ""),
			goosNm = $(this).parents("li").find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색결과", "검색결과", "검색결과_추천상품", "상품_"+branNm+"_"+goosNm);
	});
	$(document).on("click", ".productSaerchList .product-saerch .saerch-result-content .wrap-list-cart[id='groobeeRecommend'] .list-product__recommend[id='groobeeProduct'] li button.btn-cart", function () {
		GA_Event("click_MO_중문_검색결과", "검색결과", "검색결과_추천상품", "장바구니담기");
	});
	/* 검색결과 End */
	/* E: 3차 개선건 GA4 20231212 */

	/* 장바구니 Start (2023-09-13 리뉴얼) */
	$(document).on("click", ".wrap-cart .util-cart .util-cart__btn a", function(){
		if ($(this).attr("onclick") == "deleteSelectedCart();"){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상단", "선택삭제");
		} else if ($(this).attr("onclick") == "deleteRostCartConfirm2();"){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상단", "품절삭제");
		}
	});
	$(document).on("click", ".wrap-cart .util-cart .util-cart__btn .wrap-sold-out input[id='rost_cart_chk1'] + label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상단", "품절포함취소");
		} else {
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상단", "품절포함");
		}
	});
	$(document).on("click", ".wrap-cart .util-cart .util-cart__select input[id='cart_chk1'] + label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상품", "상품전체선택취소");
		} else {
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상품", "상품전체선택");
		}
	});

	// 장바구니 - 상품 있을 시
	// 세트상품
	$(document).on("click", ".wrap-cart .wrap-list-cart .item_chk input[name='chkSetCartSeq'] + label", function(){
		GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_세트상품", "상품선택");
	});
	$(document).on("click", ".wrap-cart .wrap-list-cart .item_chk button.btn_del", function(){
		if($(this).attr("onclick").indexOf("deleteSetCart") > -1){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_세트상품", "상품삭제");
		}
	});
	$(document).on("click", ".wrap-cart .wrap-list-cart .list-product .product__item a", function(){
		var prodNm1 = $(this).find(".product__brand").text();
		var prodNm2 = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_세트상품", "상품_"+prodNm1+"_"+prodNm2);
	});
	$(document).on("click", ".wrap-cart .wrap-list-cart .product__item.product__item--cart .product__price .product__option button", function(){
		var btnNm = $(this).attr("onclick");
		if (btnNm.indexOf("goOrder") > -1){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_세트상품", "바로구매");
		} else if (btnNm.indexOf("setOptionUpdateGoos") > -1){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_세트상품", "옵션수량");
		} else if (btnNm.indexOf("changeSetGoosQty") > -1){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_세트상품", "수량변경");
		} 
	});

	// 일반상품
	$(document).on("click", ".wrap-cart .list-product.list-product__cart .product__item .item_chk input[name='cartSeq'] + label", function(){
		GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상품", "상품선택");
	});
	$(document).on("click", ".wrap-cart .list-product.list-product__cart .product__item .btn_area button", function(){
		if ($(this).hasClass("btn_pin") == true){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상품", "계속담아두기");
		} else if ($(this).hasClass("btn_like_s") == true){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상품", "관심상품");
		} else if ($(this).hasClass("btn_del") == true){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상품", "상품삭제");
		}
	});
	$(document).on("click", ".wrap-cart .list-product.list-product__cart .product__item a", function(){
		var prodNm = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상품", "상품_"+prodNm);
	});
	$(document).on("click", ".wrap-cart .list-product.list-product__cart .product__item.product__item--cart .product__price .product__option button", function(){
		var btnNm1 = $(this).attr("onclick");
		var btnNm2 = $(this).attr("id");
		if (btnNm1.indexOf("goOrder") > -1){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상품", "바로구매");
		} else if (btnNm1.indexOf("optionUpdateGoos") > -1){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상품", "옵션수량");
		} else if (btnNm1.indexOf("addAginRecpNtc") > -1){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상품", "재입고알림");
		} else if (btnNm2.indexOf("cupDownBtn_") > -1){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상품", "할인쿠폰받기");
		} else if (btnNm2.indexOf("svmtDownBtn_") > -1){
			GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상품", "적립금받기");
		}
	});

	// 예상할인금액 버튼
	$(document).on("click", ".wrap-cart .wrap-payment .payment-discount .discount-wrap button#lowPriceBtn", function(){
		GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_가격영역", "예상할인금액");
	});
	// 하단붙박이 버튼
	$(document).on("click", ".wrap-payment-cart .payment-cart .payment-cart__order button[onclick='goOrder();']", function(){
		GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_하단붙박이", "주문하기");
	});

	// 장바구니 - 상품 없을 시
	$(document).on("click", ".wrap-cart .list-product.list-product__cart .cart__no-item a", function(){
		GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상품", "상품담으러가기");
	});
	$(document).on("click", ".wrap-cart .wrap-list-cart#groobeeRecommend .list-product.list-product__recommend .product__item a", function(){
		GA_Event("click_MO_중문_장바구니", "장바구니", "장바구니_상품추천", "상품_"+hnprodNm);
	});
	/* 장바구니 End */

	/* S: 3차 개선건 GA4 20231212 */
	/* 상품상세 Start */
	// 상품상세 상단
	$(document).on("click", ".productdetail .pd_descript .desc_MDcomment", function () {
		var commTxt = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "상단", "상단_코멘트", "코멘트_"+commTxt);
	});
	$(document).on("click", ".productdetail .pd_descript .desc_goods .goods_detail .goods_brand", function () {
		var branNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "상단", "상단_브랜드상세", "브랜드_"+branNm);
	});
	$(document).on("click", ".m_popup_renew[id='snsPop_layer'] .btn_type .confirm_body button", function () {
		if ($(this).hasClass("shareHpoint") == true) {
			GA_Event("click_MO_중문_상품상세", "상단", "상단_공유하기", "공유하기_Hpoint");
		} else if ($(this).hasClass("shareKakaoTalk") == true) {
			GA_Event("click_MO_중문_상품상세", "상단", "상단_공유하기", "공유하기_카카오톡");
		} else if ($(this).hasClass("shareFacebook") == true) {
			GA_Event("click_MO_중문_상품상세", "상단", "상단_공유하기", "공유하기_페이스북");
		} else if ($(this).hasClass("shareNaver") == true) {
			GA_Event("click_MO_중문_상품상세", "상단", "상단_공유하기", "공유하기_밴드");
		} else if ($(this).hasClass("shareKakao") == true) {
			GA_Event("click_MO_중문_상품상세", "상단", "상단_공유하기", "공유하기_카카오스토리");
		} else if ($(this).hasClass("shareSms") == true) {
			GA_Event("click_MO_중문_상품상세", "상단", "상단_공유하기", "공유하기_SMS");
		} else if ($(this).hasClass("shareClipboard") == true) {
			GA_Event("click_MO_중문_상품상세", "상단", "상단_공유하기", "공유하기_URL");
		}
	});
	$(document).on("click", ".productdetail .pd_descript .desc_priceinfo .save_point li button", function () {
		if ($(this).attr("onclick") == "showCouponDowonloadLayer();"){
			GA_Event("click_MO_중문_상품상세", "상단", "상단_쿠폰/적립금", "쿠폰받기");
		} else if ($(this).attr("onclick") == "showSaveLayer();"){
			GA_Event("click_MO_중문_상품상세", "상단", "상단_쿠폰/적립금", "적립금받기");
		}
	});
	$(document).on("click", ".m_popup_renew.pd-coupon[id='cup_layer'] .od button[onclick='issueAllGoosCouponn();']", function () {
		GA_Event("click_MO_중문_상품상세", "쿠폰", "쿠폰_다운로드", "쿠폰한번에받기");
	});
	$(document).on("click", ".m_popup_renew.pd-coupon[id='cup_layer'] .od .pd-coupon-wrap .pd-coupon-box button.download-btn", function () {
		var coupNm = $(this).parents(".pd-coupon-box").find(".pd-coupon-title").contents().not($(".pd-coupon-title").children("span")).text().replace(/\s/g, ""),
			coupNm2 = $(this).parents(".pd-coupon-box").find(".pd-coupon-title span").text().replace(/\s/g, "");
		if ($(this).parents(".pd-coupon-box").find(".pd-coupon-title span").length) {
			GA_Event("click_MO_중문_상품상세", "쿠폰", "쿠폰_다운로드", "쿠폰_"+coupNm+"_"+coupNm2);
		} else {
			GA_Event("click_MO_중문_상품상세", "쿠폰", "쿠폰_다운로드", "쿠폰_"+coupNm);
		}
	});
	$(document).on("click", ".m_popup_renew.pd-coupon[id='save_layer'] .od button[onclick='issueSvmts();']", function () {
		GA_Event("click_MO_중문_상품상세", "적립금", "적립금_다운로드", "적립금한번에받기");
	});
	$(document).on("click", ".m_popup_renew.pd-coupon[id='save_layer'] .od .pd-coupon-wrap .pd-coupon-box button.download-btn", function () {
		var coupNm = $(this).parents(".pd-coupon-box").find(".pd-coupon-title").contents().not($(".pd-coupon-title").children("span")).text().replace(/\s/g, ""),
			coupNm2 = $(this).parents(".pd-coupon-box").find(".pd-coupon-title span").text().replace(/\s/g, "");
		if ($(this).parents(".pd-coupon-box").find(".pd-coupon-title span").length) {
			GA_Event("click_MO_중문_상품상세", "적립금", "적립금_다운로드", "적립금_"+coupNm+"_"+coupNm2);
		} else {
			GA_Event("click_MO_중문_상품상세", "적립금", "적립금_다운로드", "적립금_"+coupNm);
		}
	});

	// 상품상세 하단붙박이
	$(document).on("click", ".m_popup_renew.payment-cart-wrap[id='goosBuyBtn'] button", function () {
		if ($(this).attr("id") == "wishPop"){
			GA_Event("click_MO_중문_상품상세", "하단붙박이", "하단붙박이", "좋아요");
		} else if ($(this).attr("onclick").indexOf("addOrderLayer") > -1){
			GA_Event("click_MO_중문_상품상세", "하단붙박이", "하단붙박이", "구매하기");
		} else if ($(this).attr("onclick").indexOf("addAginRecpNtc") > -1){
			GA_Event("click_MO_중문_상품상세", "하단붙박이", "하단붙박이", "재입고알림");
		} else if ($(this).attr("id") == "addHSharePtcp"){
			GA_Event("click_MO_중문_상품상세", "하단붙박이", "하단붙박이", "공구특가_참여하기");
		} else if ($(this).attr("id") == "completeHSharePtcp"){
			GA_Event("click_MO_중문_상품상세", "하단붙박이", "하단붙박이", "공구특가_참여완료");
		} else if ($(this).attr("id") == "addHSharePtcp"){
			GA_Event("click_MO_중문_상품상세", "하단붙박이", "하단붙박이", "공구특가_마감");
		}
	});
	$(document).on("click", ".m_popup_renew[id='pro_cart'] .purchase-info-tab[id='pro_option_list'] .product-price-amount .product-name-wrap button.product-cancel", function () {
		GA_Event("click_MO_중문_상품상세", "상품옵션선택", "상품옵션선택", "닫기");
	});
	$(document).on("click", ".m_popup_renew[id='pro_cart'] .purchase-info-tab[id='pro_option_list'] .product-price-amount .price-amount-wrap .count-amount input", function () {
		if ($(this).hasClass("plus") == true) {
			GA_Event("click_MO_중문_상품상세", "상품옵션선택", "상품옵션선택", "+");
		} else if ($(this).hasClass("minus") == true) {
			GA_Event("click_MO_중문_상품상세", "상품옵션선택", "상품옵션선택", "-");
		}
	});
	$(document).on("click", ".m_popup_renew[id='pro_cart'] .wrap-purchase-btn .purchase-btn button", function () {
		if ($(this).attr("onclick") == "addCarts('cart');"){
			GA_Event("click_MO_중문_상품상세", "상품옵션선택", "상품옵션선택", "장바구니");
		} else 	if ($(this).attr("onclick") == "addCarts('buy');"){
			GA_Event("click_MO_중문_상품상세", "상품옵션선택", "상품옵션선택", "바로구매");
		}
	});

	// 상품 일반옵션 - 탭/셀렉트방식
	$(document).on("click", ".productdetail .pd_descript .desc_opt .opt_basic .opt_basic_list li input + label", function () {
		var optTab = $(this).find("p").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "상품옵션선택", "상품옵션선택", optTab);
	});
	$(document).on("click", ".productdetail .pd_descript .desc_opt .opt_chip .chip_select .select_items ul li button.sel_item", function () {
		var optSelBox = $(this).find(".itemname").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "상품옵션선택", "상품옵션선택", optSelBox);
	});

	// 상품상세 탭(혜택/상세/리뷰)
	$(document).on("click", ".productdetail .productdetail_tab.product_tab ul li a", function () {
		var tabNm = $(this).find("span").text().replace(/[0-9]/g,""); // 숫자제외
		GA_Event("click_MO_중문_상품상세", "상단", "상단_상세탭", "상세탭_"+tabNm);
	});

	// 1.탭_혜택 : 할인,혜택 정보
	$(document).on("click", ".productdetail .pd_Paymentinfo .desc_lowestinfo .ac_head button", function () {
		GA_Event("click_MO_중문_상품상세", "상세탭_혜택", "상세탭_혜택", "최저가엿보기");
	});
	$(document).on("click", ".productdetail .pd_Paymentinfo .desc_benefitsinfo ul li .cont a[onclick='showCardInfoLayer();']", function () {
		GA_Event("click_MO_중문_상품상세", "상세탭_혜택", "상세탭_혜택", "카드혜택");
	});
	$(document).on("click", ".productdetail .pd_Paymentinfo .desc_benefitsinfo ul li .title .wrap-tooltip .btn-tooltip", function () {
		var bnftInfo = $(this).parents(".title").find("span").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "상세탭_혜택", "상세탭_혜택_툴팁보기", bnftInfo); // 적립금,H.Point,제휴할인
	});
	$(document).on("click", ".productdetail .pd_Paymentinfo .desc_hShare .hshare_status .status_head .wrap-tooltip .btn-tooltip", function () {
		GA_Event("click_MO_중문_상품상세", "상세탭_혜택", "상세탭_혜택_툴팁보기", "공구특가");
	});
	$(document).on("click", ".productdetail .pd_Paymentinfo .desc_req .wrap-accordion .accordion__tit button", function () {
		var bnftTxt = $(this).parents(".accordion__tit").contents().not($(this)).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "상세탭_혜택", "상세탭_혜택_안내사항", bnftTxt);
	});
	// 1.탭_혜택 : 세트상품
	$(document).on("click", ".productdetail .pd_set .pn-cont .set_product .attention__tit button", function () {
		var goosTab = $(this).parents(".attention__tit").find(".set_prodname").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "상세탭_혜택", "상세탭_혜택_세트상품", "상품_"+goosTab);
	});
	$(document).on("click", ".productdetail .pd_set .pn-cont .set_product .fold_cont a .set_goods_img", function () {
		var goosNm = $(this).parents(".set_product").find(".attention__tit .set_prodname").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "상세탭_혜택", "상세탭_혜택_세트상품_상품", "상품_"+goosNm);
	});
	$(document).on("click", ".productdetail .pd_set .pn-cont .set_product .fold_cont .set_goods_tool .num_amount input", function () {
		if ($(this).hasClass("plus") == true) {
			GA_Event("click_MO_중문_상품상세", "상세탭_혜택", "상세탭_혜택_세트상품_상품", "+");
		} else if ($(this).hasClass("minus") == true) {
			GA_Event("click_MO_중문_상품상세", "상세탭_혜택", "상세탭_혜택_세트상품_상품", "-");
		}
	});
	$(document).on("click", ".productdetail .pd_set .pn-cont .set_product .fold_cont .set_goods_tool button", function () {
		var goosBtn = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "상세탭_혜택", "상세탭_혜택_세트상품_상품", goosBtn); // 구성보기, 세트상품선택, 담기, 세트담기
	});
	// 1.탭_혜택 : 세트상품 > 세트구성보기
	$(document).on("click", ".m_popup_renew[id='setEvtGoosLayer'] .float_btn .wrap-btn .count-amount input", function () {
		if ($(this).hasClass("plus") == true) {
			GA_Event("click_MO_중문_상품상세", "세트구성보기", "세트구성보기", "+");
		} else if ($(this).hasClass("minus") == true) {
			GA_Event("click_MO_중문_상품상세", "세트구성보기", "세트구성보기", "-");
		}
	});
	$(document).on("click", ".m_popup_renew[id='setEvtGoosLayer'] .float_btn .wrap-btn button", function () {
		if ($(this).attr("onclick").indexOf("checkSetCartCnt") > -1){
			GA_Event("click_MO_중문_상품상세", "세트구성보기", "세트구성보기", "장바구니담기");
		}
	});
	// 1.탭_혜택 : 세트상품 > 세트상품선택
	$(document).on("click", ".m_popup_renew[id='setEvtLayer'] .content_wrap[id='setGoosEvtList'] .od .select-brand-wrap .select-brand li label", function () {
		var branNm = $(this).find(".sb-name").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "세트상품선택", "세트상품선택_브랜드선택", "브랜드_"+branNm);
	});
	$(document).on("click", ".m_popup_renew[id='setEvtLayer'] .content_wrap[id='setGoosEvtList'] .od .select-product-wrap .select-product #evtGoosMoreList li", function () {
		var branNm = $(this).attr("data-brannm").replace(/\s/g, ""),
			goosNm = $(this).attr("data-goosnm").replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "세트상품선택", "세트상품선택_상품선택", "상품_"+branNm+"_"+goosNm);
	});
	$(document).on("click", ".m_popup_renew[id='add_to_cart'] .od .cart-product-list #setEvtGoosChoiList li .product-name-wrap button.product-cancel", function () {
		// 이슈 : GA4 이벤트 안찍힘. op/setEvt/setEvtLayerGoosOnly.jsp 파일에 function removeEvtCartProuct(id) 함수 안에 스크립트 넣어야함.
		GA_Event("click_MO_중문_상품상세", "세트상품선택", "세트상품선택", "닫기");
	}); 
	$(document).on("click", ".m_popup_renew[id='add_to_cart'] .od .cart-product-list #setEvtGoosChoiList li .price-amount-wrap .count-amount input", function () {
		if ($(this).hasClass("plus") == true) {
			GA_Event("click_MO_중문_상품상세", "세트상품선택", "세트상품선택", "+");
		} else if ($(this).hasClass("minus") == true) {
			GA_Event("click_MO_중문_상품상세", "세트상품선택", "세트상품선택", "-");
		}
	});
	$(document).on("click", ".m_popup_renew[id='add_to_cart'] .float_btn button[id='setCartBtn']", function () {
		GA_Event("click_MO_중문_상품상세", "세트상품선택", "세트상품선택", "장바구니에담기");
	});
	// 1.탭_혜택 : 세트상품 > 팝업_중복세트안내
	$(document).on("click", ".m_popup_renew[id='layer_default'] .confirm_group .confirm_body button", function () {
		var btnNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "중복세트안내", "중복세트안내_팝업", btnNm);
	});
	$(document).on("click", ".m_popup_renew[id='layer_default'] .float_btn button.btn_confirm", function () {
		GA_Event("click_MO_중문_상품상세", "중복세트안내", "중복세트안내_팝업", "취소");
	});
	// 1.탭_혜택 : 사은품
	$(document).on("click", ".productdetail .pd_gift .pd-giftlist-swiper ul li .giftitem .attention__tit button", function () {
		GA_Event("click_MO_중문_상품상세", "상세탭_혜택", "상세탭_혜택_사은품", "행사자세히보기");
	});

	// 2.탭_상세 : 브랜드혜택알림
	$(document).on("click", ".productdetail .pd_descript_contents .brandzone .btn_area button", function () {
		var branNm = $(this).parents(".brandzone").find(".name").text().replace(/\s/g, "");
		if ($(this).attr("id") == "likeBranBtn"){
			GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_"+branNm, "관심브랜드");
		} else if ($(this).attr("id") == "alarmBtn"){
			GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_"+branNm, "브랜드혜택알림");
		}
	});
	if ($(".container").find(".productdetail").length) {
		$(document).on("click", ".wrap-calendar .wrap-calendar__inner .area-calendar + button.btn-square", function(){
			var optNm = $(".m_popup_renew[id='brandAlarmViewLayerPop'] .od .odform-brand-notification .form_cont .temp_data").find("input").val().replace(/\s/g, "");
			GA_Event("click_MO_중문_상품상세", "브랜드혜택알림설정", "브랜드혜택알림설정", "출국일_"+optNm);
		});
		$(document).on("click", ".wrap-list-dropdown .list-dropdown[data-parentid='telNatiCd'] li button", function(){
			var optNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_상품상세", "브랜드혜택알림설정", "브랜드혜택알림설정", "국가/지역_"+optNm);
		});
		$(document).on("click", ".m_popup_renew[id='brandAlarmViewLayerPop'] .float_btn button", function(){
			if ($(this).attr("onclick") == "SendAlramData();"){
				GA_Event("click_MO_중문_상품상세", "브랜드혜택알림설정", "브랜드혜택알림설정", "신청");
			} else {
				GA_Event("click_MO_중문_상품상세", "브랜드혜택알림설정", "브랜드혜택알림설정", "취소");
			}
		});
	}
	// 2.탭_상세 : 유의사항
	$(document).on("click", ".productdetail .pd_descript_contents div", function(){
		if ($(this).hasClass("pd_noti_notiprod") == true) {
			GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_유의사항", "상품정보고시");
		} else if ($(this).hasClass("pd_noti_refund") == true) {
			GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_유의사항", "취소/교환/환불/안내");
		} else if ($(this).hasClass("pd_noti_guide") == true) {
			GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_유의사항", "쇼핑가이드");
		} else if ($(this).hasClass("pd_noti_orderingtime") == true) {
			GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_유의사항", "출국지별주문가능시간");
		} else if ($(this).hasClass("pd_acd_mustread") == true) {
			GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_유의사항", "구매전유의사항");
		}
	});
	// 2.탭_상세 : 상품영역
	$(document).on("click", ".productdetail [class*=pd_pn_] .cont .list-product.list-product__recommend li a", function(){
		var branNm = $(this).parents("li").attr("data-brannm").replace(/\s/g, ""),
			goosNm = $(this).parents("li").attr("data-goosnm").replace(/\s/g, "");
		if ($(this).parents().hasClass("pd_pn_recommended") == true) {
			GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_추천상품", "상품_"+branNm+"_"+goosNm);
		} else if ($(this).parents().hasClass("pd_pn_bestbrand") == true) {
			GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_베스트브랜드", "상품_"+branNm+"_"+goosNm);
		} else if ($(this).parents().hasClass("pd_pn_ititems") == true) {
			GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_제안잇템", "상품_"+branNm+"_"+goosNm);
		}
	});
	$(document).on("click", ".productdetail [class*=pd_pn_] .cont .list-product.list-product__recommend li .product__img button.btn-cart", function(){
		if ($(this).parents().hasClass("pd_pn_recommended") == true) {
			GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_추천상품", "장바구니담기");
		} else if ($(this).parents().hasClass("pd_pn_bestbrand") == true) {
			GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_베스트브랜드", "장바구니담기");
		} else if ($(this).parents().hasClass("pd_pn_ititems") == true) {
			GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_제안잇템", "장바구니담기");
		}
	});
	$(document).on("click", ".productdetail .pd_pn_bestbrand .tit a", function(){
		branNm = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_베스트브랜드", branNm+"_브랜드관바로가기");
	});
	$(document).on("click", ".productdetail .pd_pn_ititems .cont .list-product.list-product__recommend li button#wishPopGrb", function(){
		GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_제안잇템", "좋아요");
	});

	// 3.탭_리뷰 : 일반리뷰, 포토리뷰 보기
	$(document).on("click", ".productdetail .pd_pointreview .pn-tit[id='totalReview1'] a, .productdetail .pd_filterview .product-no-review[id='noAllGrvwsListDiv'] a", function(){
		GA_Event("click_MO_중문_상품상세", "상세탭_리뷰", "상세탭_일반리뷰", "리뷰등록");
	});
	$(document).on("click", ".productdetail .pd_filterview .pn-cont[id='allGrvwsListDiv'] .review-detail-cont a", function(){
		var reviewTit = $(this).find(".review-detail-text .title").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "상세탭_리뷰", "상세탭_일반리뷰", "리뷰보기_"+reviewTit);
	});
	$(document).on("click", ".productdetail .pd_pointreview .pn-cont[id='totalReview2'] #photoGrvwsListDiv ul li button", function(){
		if ($(this).hasClass("more_photo") == true) {
			GA_Event("click_MO_중문_상품상세", "상세탭_리뷰", "상세탭_포토리뷰", "더보기");
		} else {
			var reviewTit = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_상품상세", "상세탭_리뷰", "상세탭_포토리뷰", "리뷰보기_"+reviewTit);
		}
	});
	function reviewFunc() {
		var reviewTit = $(".m_popup_renew[id='dtlGrvwsPop']").find(".review-detail-cont .review-detail-text .title").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "상세탭_리뷰", "상세탭_포토리뷰", "리뷰보기_"+reviewTit);
	}
	$(document).on("click", ".photo-review-wrap ul li a.review-img", function(){
		setTimeout(reviewFunc, 500);
	});
	
	if ($(".container").find(".productdetail .pd_filterview").length) {
		$(document).on("click", ".wrap-list-dropdown .list-dropdown[data-parentid='allGrvwsSort'] li button", function(){
			var optNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_상품상세", "상세탭_리뷰", "상세탭_리뷰_정렬기준", "정렬기준_"+optNm);
		});
	}
	$(document).on("click", ".m_popup_renew[id='grvwsFilter_layer'] .od .btn_option_group button", function(){
		var optNm = $(this).text().replace(/\s/g, "");
		if ($(this).parent("div").attr("id") == "typeBtn"){
			GA_Event("click_MO_중문_상품상세", "상세탭_리뷰", "상세탭_리뷰_보기옵션", "유형_"+optNm);
		} else if ($(this).parent("div").attr("id") == "noteBtn"){
			GA_Event("click_MO_중문_상품상세", "상세탭_리뷰", "상세탭_리뷰_보기옵션", "평점_"+optNm);
		}
	});
	$(document).on("click", ".m_popup_renew[id='grvwsFilter_layer'] .float_btn button", function(){
		if ($(this).attr("onclick") == "fnSrchGrvws('reset');"){
			GA_Event("click_MO_중문_상품상세", "상세탭_리뷰", "상세탭_리뷰_보기옵션", "초기화");
		} else if ($(this).attr("onclick") == "fnSrchGrvws('srch');"){
			GA_Event("click_MO_중문_상품상세", "상세탭_리뷰", "상세탭_리뷰_보기옵션", "조회");
		}
	});
	// 3.탭_리뷰 : 일반리뷰, 포토리뷰 등록
	$(document).on("click", ".m_popup_renew[id='addGoosGrvws'] .content_wrap .od .review-regist-panel .star-rating .star_grade button", function(){
		if ($(this).parent(".star_grade").find(".on").length == 5){
			GA_Event("click_MO_중문_상품상세", "상세탭_리뷰등록", "상세탭_리뷰등록_평점", "평점_5점");
		} else if ($(this).parent(".star_grade").find(".on").length == 4){
			GA_Event("click_MO_중문_상품상세", "상세탭_리뷰등록", "상세탭_리뷰등록_평점", "평점_4점");
		} else if ($(this).parent(".star_grade").find(".on").length == 3){
			GA_Event("click_MO_중문_상품상세", "상세탭_리뷰등록", "상세탭_리뷰등록_평점", "평점_3점");
		} else if ($(this).parent(".star_grade").find(".on").length == 2){
			GA_Event("click_MO_중문_상품상세", "상세탭_리뷰등록", "상세탭_리뷰등록_평점", "평점_2점");
		} else if ($(this).parent(".star_grade").find(".on").length == 1){
			GA_Event("click_MO_중문_상품상세", "상세탭_리뷰등록", "상세탭_리뷰등록_평점", "평점_1점");
		}
	});
	$(document).on("click", ".m_popup_renew[id='addGoosGrvws'] .content_wrap .od .review-regist-panel .attach-img-wrap #grvwsfileList .attimg label[onclick='fnFileMulti();']", function(){
		GA_Event("click_MO_중문_상품상세", "상세탭_리뷰등록", "상세탭_리뷰등록_사진첨부", "추가");
	});
	$(document).on("click", ".m_popup_renew[id='addGoosGrvws'] .content_wrap .od .review-regist-panel .attach-img-wrap #grvwsfileList .attimg button", function(){
		// 이슈 : GA4 이벤트 안찍힘. gd/dtl/iframe/addGoosGrvwsForm.jsp 파일에 function delFile(e, fileCnt) 함수 안에 스크립트 넣어야함.
		if ($(this).attr("onclick").indexOf("delFile") > -1){
			GA_Event("click_MO_중문_상품상세", "상세탭_리뷰등록", "상세탭_리뷰등록_사진첨부", "삭제");
		}
	});
	$(document).on("click", ".m_popup_renew[id='addGoosGrvws'] .content_wrap .float_btn button[onclick='save();']", function(){
		GA_Event("click_MO_중문_상품상세", "상세탭_리뷰등록", "상세탭_리뷰등록", "등록");
	});
	// S : 2025-04-30 국중영 MO 상품상세 GA4 추가
	$(document).on("click", ".productdetail .pd_descript .desc_low_price", function(){
		GA_Event("click_MO_중문_상품상세", "혜택적용가", "혜택적용가", "더보기");		
	});
	$(document).on("click", ".productdetail .pd_Paymentinfo .desc_benefitsinfo .cont-card-bnft a", function(){
		var benefitNm = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "결제혜택", "결제혜택_상세탭", benefitNm);		
	});
	$(document).on("click", ".productdetail .pd_Paymentinfo .desc_branevnt .desc-cont .swiper-slide", function(){
		var bannerNm = $(this).find(".pd-branevnt__info .tit").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "브랜드행사", "브랜드행사_배너", bannerNm);		
	});
	$(document).on("click", ".productdetail .pd_Paymentinfo .desc_gift .desc-cont .swiper-slide", function(){
		var prdNm = $(this).find(".pd-gift__info .tit").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "사은품", "사은품_배너", prdNm);		
	});
	$(document).on("click", ".productdetail .pd_descript_contents .brandzone .bran_shop", function(){
		var brdNm = $(this).find(".name").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세_브랜드", brdNm);		
	});
	$(document).on("click", ".productdetail .pd_descript_contents .brandzone .bran_btn button", function(){
		var btnNm;
		if($(this).hasClass("btn_like")){btnNm = "좋아요"}
		else {btnNm = "알림설정"}
		GA_Event("click_MO_중문_상품상세", "상세탭_상세", "상세탭_상세", btnNm);		
	});
	// E : 2025-04-30 국중영 MO 상품상세 GA4 추가
	/* 상품상세 End */

	/* 상품리스트(상품유닛) Start */
	// 상품리스트 - 상단
	$(document).on("click", ".header .header_top .category-menu-one-depth ul li a", function(){
		var cateNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_상품리스트", "상품리스트", "상품리스트_카테고리", "카테고리_"+cateNm);
	});
	$(document).on("click", ".productList .product-list .category-menu-two-depth-wrap .category-menu-two-depth ul li a", function(){
		if ($(".header .header_top").find(".category-menu-one-depth-btn").length){
			var cateNm = $(this).parents("body").find(".header .header_top .category-menu-one-depth-btn").text().replace(/\s/g, ""),
				cateNm2 =  $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_상품리스트", "상품리스트", "상품리스트_카테고리", "카테고리_"+cateNm+"_"+cateNm2);
		} else {
			var cateNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_상품리스트", "상품리스트", "상품리스트_카테고리", "카테고리_"+cateNm);
		}
	});
	$(document).on("click", ".productList .product-list .product-saerch-list-top .product-saerch-list-middle .toggle-switch-wrap label input[id='filterSoldOutYn']", function () {
		if ($(this).is(":checked") == true){
			GA_Event("click_MO_중문_상품리스트", "상품리스트", "상품리스트_상단", "품절_토글on");
		} else {
			GA_Event("click_MO_중문_상품리스트", "상품리스트", "상품리스트_상단", "품절_토글off");
		}
	});
	if ($(".container").find(".productList").length) {
		$(document).on("click", ".wrap-list-dropdown .list-dropdown[data-parentid='goodsListOrder'] li button", function(){
			var sortNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_상품리스트", "상품리스트", "상품리스트_상단", "정렬기준_"+sortNm);
		});
	}
	// 상품리스트
	// 1.타입_상품
	$(document).on("click", ".productList .product-list .saerch-result-content #goosArea .goosMoreArea .list-product__searchlist .goosList.item a", function () {
		var branNm = $(this).parents("li").attr("data-brannm").replace(/\s/g, ""),
			goosNm = $(this).parents("li").attr("data-goosnm").replace(/\s/g, "");
		GA_Event("click_MO_중문_상품리스트", "상품리스트", "상품리스트_상품선택", "상품_"+branNm+"_"+goosNm);
	});
	$(document).on("click", ".productList .product-list .saerch-result-content #goosArea .goosMoreArea .list-product__searchlist .goosList.item .cart > a", function () {
		GA_Event("click_MO_중문_상품리스트", "상품리스트", "상품리스트_상품선택", "장바구니담기");
	});
	// 2.타입_이벤트/기획전 ----> 확인불가
	// 3.타입_브랜드 ----> 확인불가
	// 4.타입_럭키딜/타임세일/커밍순/사은행사 ----> 확인불가
	// 5.타입_쿠폰/적립금 ----> 확인불가
	// 6.타입_동영상 ----> 확인불가

	// 상품리스트 - 상품추천 영역 ----> 확인불가
	/* 상품리스트(상품유닛) End */
	/* E: 3차 개선건 GA4 20231212 */

	/* 상품상세 공구특가 Start */
	if ($("body").find(".pd_hshare").length) {
		$(document).on("click", ".product_detail .pd_hshare .square_tooltip > a", function () {
			GA_Event("click_MO_중문_상품상세_공구특가", "상단", "상단_공구특가혜택", "툴팁");
		});

		$(document).on("click", ".product_detail .parallelimport_message .pro_screen", function () {
			if ($(this).hasClass("open") == true) {
				GA_Event("click_MO_중문_상품상세_공구특가", "상단", "상단_구매안내", "펼치기");
			} else {
				GA_Event("click_MO_중문_상품상세_공구특가", "상단", "상단_구매안내", "접기");
			};
		});
	};
	/* 상품상세 공구특가 End */

	/* 주문서 Start (2023-09-13 리뉴얼) */
	// 할인탭
	$(document).on("click", ".od .wrap-accordion .accordion__tit button", function(){
		var tabNm = $(this).parents(".ac_head").find(".tit_box .tit").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_주문서", "할인", "할인", "할인탭_"+tabNm);
	});

	// 할인탭 - 주문상품
	$(document).on("click", ".od .accordion_item .ac_body[id='acd-order-1'] .order_list > li", function(){
		var prodNm1 = $(this).find(".order_goods_info .order_tit").text().replace(/\s/g, ""),
			prodNm2 = $(this).find(".order_goods_info .order_detail").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_주문상품", prodNm1+"_"+prodNm2);
	});
	$(document).on("change", ".od .accordion_item .ac_body[id='acd-order-1'] .order_list > li .otp_apply li .wrap-select select", function(){
		var val = $(this).find("option:selected").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_주문상품", "필터_"+val);
	});

	// 할인탭 - 할인적용
	$(document).on("change", ".od .accordion_item .ac_body[id='acd-order-2'] .otp_apply li .wrap-select select[name='geneMbshCupSeq']", function(){
		var val = $(this).val();
		GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_할인적용", "필터_"+val); //장바구니쿠폰
	});
	$(document).on("change", ".od .accordion_item .ac_body[id='acd-order-2'] .otp_apply li .temp_opt select[name='dblMbshCupSeq']", function(){
		var val = $(this).val();
		GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_할인적용", "필터_"+val); //더블쿠폰
	});
	$(document).on("click", ".od .accordion_item .ac_body[id='acd-order-2'] #cardPtnrRsvgDcInfoDoma .r_item input + label", function(){
		if ($(this).prev("input").is(":checked")){
			var cardNm = $(this).find(".r_head .tit_box span").text().replace(/\s/g, "");
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_할인적용", "카드제휴즉시할인_"+cardNm);
		}
	});
	$(document).on("change", ".od .accordion_item .ac_body[id='acd-order-2'] .otp_apply li .odform .input_multi .temp_opt select[name='ptnrPmptDcType']", function(){
		var val = $(this).val();
		if (val == "001"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_할인적용", "제휴사인증할인_KT");
		} else if (val == "003"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_할인적용", "제휴사인증할인_LGU+");
		}
	});
	$(document).on("click", ".od .accordion_item .ac_body[id='acd-order-2'] .otp_apply li .odform .input_multi button[onclick='fnPtnrPmptDcApply();']", function(){
		GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_할인적용", "제휴사인증할인_조회적용");
	});

	// 할인탭 - 적립금
	$(document).on("click", ".od .accordion_item .ac_body[id='acd-order-3'] .otp_apply li .odform input[name='pmptUseSvmtUseYn'] + label", function(){
		if ($(this).prev().val() == "Y"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_적립금", "즉시할인적립금_전액사용");
		} else if ($(this).prev().val() == "N"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_적립금", "즉시할인적립금_적립");
		}
	});
	$(document).on("change", ".od .accordion_item .ac_body[id='acd-order-3'] .otp_apply li .odform .input_multi .temp_opt input", function(){
		var mileAm = $(this).val();
		if ($(this).attr("name") == "svmtAmt"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_적립금", "기본적립금"+mileAm+"원");
		} else if ($(this).attr("name") == "evntSvmtAmt"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_적립금", "추가적립금"+mileAm+"원");
		} else if ($(this).attr("name") == "branSvmtAmt"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_적립금", "브랜드적립금"+mileAm+"원");
		}
	});
	$(document).on("click", ".od .accordion_item .ac_body[id='acd-order-3'] .otp_apply li .odform .input_multi .temp_opt + button", function(){
		if ($(this).attr("onclick").indexOf("allUseSvmtClick();") > -1){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_적립금", "전액사용_기본적립금");
		} else if ($(this).attr("onclick").indexOf("allUseEvntSvmtClick();") > -1){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_적립금", "전액사용_추가적립금");
		} else if ($(this).attr("onclick").indexOf("allUseBranSvmtClick();") > -1){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_적립금", "전액사용_브랜드적립금");
		} else if ($(this).attr("onclick").indexOf("plusSvmtLayerPopupOpen('ptns');") > -1){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_적립금", "조회사용_제휴플러스");
		} else if ($(this).attr("onclick").indexOf("plusSvmtLayerPopupOpen('sett');") > -1){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_적립금", "조회사용_결제플러스");
		}
	});
	$(document).on("click", "#ptnsSvmtLayerPopup button[onclick='ptnsPlsSvmtAppl();']", function(){
		var mileAm = $(".od .accordion_item .ac_body[id='acd-order-3'] .otp_apply li .odform .input_multi .temp_opt input[id='ptnsSvmtCalcAmt']").val();
		GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_적립금", "제휴플러스"+mileAm+"원");
	});
	$(document).on("click", "#settSvmtLayerPopup button[onclick='settPlsSvmtAppl();']", function(){
		var mileAm = $(".od .accordion_item .ac_body[id='acd-order-3'] .otp_apply li .odform .input_multi .temp_opt input[id='dispSettSvmtAmt']").val();
		GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_적립금", "결제플러스"+mileAm+"원");
	});

	// 20250923 주문서 적립금 영역 추가
	$(document).on("click", ".od .wrap-accordion .ac_body .max_mileage_apply .btn_switch", function(){
		GA_Event("click_MO_국문_주문서", "할인", "할인_할인탭_적립금할인", "최대혜택 적용 토글");
	});
	$(document).on("click", ".od .wrap-accordion .ac_body .max_mileage_applied .wrap-tooltip__tit #geneSvmtUseYn button", function(){
		GA_Event("click_MO_국문_주문서", "할인", "할인_할인탭_적립금할인", "기본적립금보기");
	});
	$(document).on("click", ".od .wrap-accordion .ac_body .max_mileage_applied .wrap-tooltip__tit #evntSvmtUseYn button", function(){
		GA_Event("click_MO_국문_주문서", "할인", "할인_할인탭_적립금할인", "추가적립금보기");
	});
	$(document).on("click", ".od .wrap-accordion .ac_body .max_mileage_applied .wrap-tooltip__tit #branSvmtUseYn button", function(){
		GA_Event("click_MO_국문_주문서", "할인", "할인_할인탭_적립금할인", "브랜드적립금보기");
	});
	$(document).on("click", ".od .wrap-accordion .ac_body #ptnsPlsArea #ptnsBtn", function(){
		GA_Event("click_MO_국문_주문서", "할인", "할인_할인탭_적립금할인", "제휴적립금조회하기");
	});
	$(document).on("click", ".od .wrap-accordion .ac_body #ptnsPlsArea #ptnsUseBtn", function(){
		GA_Event("click_MO_국문_주문서", "할인", "할인_할인탭_적립금할인", "제휴적립금변경하기");
	});

	// 할인탭 - 제휴포인트
	$(document).on("click", ".od .accordion_item .ac_body[id='acd-order-5'] .otp_apply li .odform input[name='hpoinPlsUseYn']", function(){
		if ($(this).val() == "Y"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_제휴포인트", "H.POINTPLUS_사용");
		} else if ($(this).val() == "N"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_제휴포인트", "H.POINTPLUS_미사용");
		}
	});
	$(document).on("change", ".od .accordion_item .ac_body[id='acd-order-5'] .otp_apply li .odform .input_multi .temp_opt input", function(){
		var pointAm = $(this).val();
		if ($(this).attr("name") == "hpoinAmt"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_제휴포인트", "H.POINTPAY"+pointAm+"원");
		} else if ($(this).attr("name") == "ezwelWlfrPoinAmt"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_제휴포인트", "이지웰포인트"+pointAm+"원");
		} else if ($(this).attr("name") == "ezwelSvmtAmt"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_제휴포인트", "이지웰적립금"+pointAm+"원");
		} else if ($(this).attr("name") == "ezwelSpclPoinAmt"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_제휴포인트", "이지웰특별포인트"+pointAm+"원");
		}
	});
	$(document).on("click", ".od .accordion_item .ac_body[id='acd-order-5'] .otp_apply li .odform .input_multi .temp_opt + button", function(){
		if ($(this).attr("onclick").indexOf("allUseHpoinClick();") > -1){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_제휴포인트", "전액사용_H.POINTPAY");
		} else if ($(this).attr("onclick").indexOf("allUseEzwelWlfrPoinClick();") > -1){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_제휴포인트", "전액사용_이지웰포인트");
		} else if ($(this).attr("onclick").indexOf("allUseEzwelSvmtClick();") > -1){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_제휴포인트", "전액사용_이지웰적립금");
		} else if ($(this).attr("onclick").indexOf("allUseEzwelSpclPoinClick();") > -1){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_제휴포인트", "전액사용_이지웰특별포인트");
		}
	});

	// 할인탭 - 예치금/선수금/상품권전환금
	$(document).on("change", ".od .accordion_item .ac_body[id='acd-order-4'] .otp_apply li .odform .input_multi .temp_opt input", function(){
		var pointAm = $(this).val();
		if ($(this).attr("name") == "cdpstAmt"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_예치금선수금상품권전환금", "예치금"+pointAm+"원");
		} else if ($(this).attr("name") == "advsAmt"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_예치금선수금상품권전환금", "선수금"+pointAm+"원");
		} else if ($(this).attr("name") == "gfcaCdpstAmt"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_예치금선수금상품권전환금", "상품권전환금"+pointAm+"원");
		}
	});
	$(document).on("click", ".od .accordion_item .ac_body[id='acd-order-4'] .otp_apply li .odform .input_multi .temp_opt + button", function(){
		if ($(this).attr("onclick").indexOf("allUseCdpstClick();") > -1){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_예치금선수금상품권전환금", "전액사용_예치금");
		} else if ($(this).attr("onclick").indexOf("allUseAdvsClick();") > -1){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_예치금선수금상품권전환금", "전액사용_선수금");
		} else if ($(this).attr("onclick").indexOf("allUseGfcaCdpstClick();") > -1){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_예치금선수금상품권전환금", "전액사용_상품권전환금");
		}
	});

	// 할인탭 - 대한항공스카이패스마일리지적립
	$(document).on("click", ".od .accordion_item.not_folded .ac_body .box_mileage #koreanAir", function(){
		GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_대한항공스카이패스마일리지적립", "조회");
	});
	
	// 할인탭 - 친환경캠페인참여
	$(document).on("click", ".od .accordion_item.not_folded .ac_body .radio_custom_group .r_item input[name='sbagUseYn']", function(){
		if ($(this).val() == "N"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_친환경캠페인참여", "쇼핑백사용안함");
		} else if ($(this).val() == "Y"){
			GA_Event("click_MO_중문_주문서", "할인", "할인_할인탭_친환경캠페인참여", "쇼핑백사용");
		}
	});

	// 할인탭 - 결제정보
	// $(document).on("click", ".od .wrap-payment-method .ac_body[id='acd-order-6'] .payment_tab .tab_list li", function(){
	// 	var tabNm = $(this).contents().not($(this).children()).text().replace(/\s/g, "");
	// 	GA_Event("click_MO_중문_주문서", "결제정보", "결제정보_탭", "탭_"+tabNm);
	// });
	// 결제정보 탭 (pages/or/order/orderScriptTop.jsp)

	$(document).on("click", ".od .wrap-payment-method .ac_body[id='acd-order-6'] .payment_tab .tab_cont .r_item input[name='hpay'] + label", function(){
		if ($(this).prev("input").attr("id") == "hpay_01"){
			GA_Event("click_MO_중문_주문서", "결제정보", "결제정보_탭_H.POINTPAY", "hpay카드결제");
		} else if ($(this).prev("input").attr("id") == "hpay_02"){
			GA_Event("click_MO_중문_주문서", "결제정보", "결제정보_탭_H.POINTPAY", "hpay계좌이체");
		}
	});
	$(document).on("change", ".od .wrap-payment-method .ac_body[id='acd-order-6'] .payment_tab .tab_cont .temp_opt select.orderSettCardList", function(){
		GA_Event("click_MO_중문_주문서", "결제정보", "결제정보_탭_신용카드", "카드선택");
	});
	$(document).on("click", ".od .wrap-payment-method .ac_body[id='acd-order-6'] .payment_tab .tab_cont .temp_opt select.orderSettCardList + #mPoitLayer label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_MO_중문_주문서", "결제정보", "결제정보_탭_신용카드", "포인트사용취소");
		} else {
			GA_Event("click_MO_중문_주문서", "결제정보", "결제정보_탭_신용카드", "포인트사용");
		}
	});
	$(document).on("click", ".od .wrap-payment-method .ac_body[id='acd-order-6'] .payment_tab .tab_cont .list-payment-card li label", function(){
		var payNm = $(this).find(".txt-label").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_주문서", "결제정보", "결제정보_탭_간편결제", "간편결제_"+payNm); //이슈사항 : 국문만 2번 찍힘
	});
	// $(document).on("click", ".od .wrap-payment-method .ac_body[id='acd-order-6'] .payment_tab .tab_cont .r_item input + label", function(){
	// 	var payNm = $(this).parents(".r_item").find(".r_head .tit_box").text().replace(/\s/g, "");
	// 	if ($(this).prev("input").attr("id").indexOf("etcSett") > -1){
	// 		GA_Event("click_MO_중문_주문서", "결제정보", "결제정보_탭_기타결제수단", payNm);
	// 	}
	// });
	$(document).on("click", ".od .wrap-payment-method .ac_body[id='acd-order-6'] .payment_tab .tab_cont .odform .form_cont input[class='befSettWaySaveYn'] + label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_MO_중문_주문서", "결제정보", "결제정보", "선택한결제수단다음에도사용취소");
		} else {
			GA_Event("click_MO_중문_주문서", "결제정보", "결제정보", "선택한결제수단다음에도사용");
		}
	});
	$(document).on("click", ".od .odform.cashRcptTable .form_cont input[name='tempTrdrClsCd'] + label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_MO_중문_주문서", "최종결제", "결제정보", "현금영수증신청취소");
		} else {
			GA_Event("click_MO_중문_주문서", "최종결제", "결제정보", "현금영수증신청");
		}
	});
	$(document).on("click", ".wrap-order-float .payment-cart .payment-cart__order button[onclick='goSett();']", function(){
		GA_Event("click_MO_중문_주문서", "결제정보", "결제정보", "결제하기");
	});
	$(document).on("click", ".wrap-order-float .wrap-order-check .wrap-form__checkbox label input[id='chkAgree']", function(){
		if ($(this).is(":checked")){
			GA_Event("click_MO_중문_주문서", "최종결제", "결제정보", "주문내역확인동의");
		} else {
			GA_Event("click_MO_중문_주문서", "최종결제", "결제정보", "주문내역확인동의취소");
		}
	});
	/* 주문서 End */

	/* 브랜드관 Start */
	if ($("body").find(".contaner_brand.baseBrand").length){
		var branCd = $(".bottom_top_swiper .brandshop_swiper_bottom .bull_like_area input[id='onlnBranCd']").attr("value"),
			branNm = $(".header .header_top .headerTitle").text().replace(/\s/g, "");

		$(document).on("click", ".baseBrand .bottom_top_swiper .brandshop_swiper_bottom .bull_like_area a", function () {
			if ($(this).hasClass("bull_alim") == true) {
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm, branNm+"_상단", "알림설정");
			} else if ($(this).hasClass("bull_like") == true) {
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm, branNm+"_상단", "좋아요");
			}
		});
		
		$(document).on("click", ".baseBrand .coupon_list_wrap .coupon_list li a", function(){
			var bnnrNm = $(this).parents("li").attr("id");
			if (bnnrNm.indexOf("cup_") > -1){
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm, branNm+"_상단_쿠폰", "쿠폰받기");
			} else if (bnnrNm.indexOf("svmt_") > -1){
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm, branNm+"_상단_쿠폰", "적립금받기");
			} 
		});
		
		$(document).on("click", ".baseBrand .brand_con_all_area .banner_visual .visual_item a", function () {
			var bnnrNm = $(this).find(".visual_txt_area .banner_tit").text().replace(/\s/g, "");
			GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm, branNm+"_상단_브랜드행사배너", "배너_"+bnnrNm);
		});
		
		$(document).on("click", ".baseBrand .bottom_page.brand_type .navSection_swiper .section_tab .tab_item a", function () {
			var tabNm = $(this).find("span").text().replace(/\s/g, "");
			GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm, branNm+"_상세탭", "상세탭_"+tabNm);
		});
		
		$(document).on("change", ".baseBrand .total-wrap .prd_sort #goodsListOrder", function () {
			var tabNm = $(".bottom_page.brand_type .navSection_swiper .section_tab .tab_item.is_selected a span").text().replace(/\s/g, "");
			var val = $(this).val();
			if (val == "best") {
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_정렬기준", "정렬기준_베스트순");
			} else if (val == "new") {
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_정렬기준", "정렬기준_신상품순");
			} else if (val == "priceAsc") {
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_정렬기준", "정렬기준_낮은가격순");
			} else if (val == "priceDesc") {
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_정렬기준", "정렬기준_높은가격순");
			} else if (val == "dcRate") {
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_정렬기준", "정렬기준_높은할인순");
			} else if (val == "grvws") {
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_정렬기준", "정렬기준_상품평많은순");
			};
		});
		
		$(document).on("click", ".baseBrand .bottom_page.brand_type .prd_list_new li > a:not(.no_stoc), .baseBrand .bottom_page.brand_type .prd_list_new .prd_tit2 a", function () {
			var tabNm = $(".bottom_page.brand_type .navSection_swiper .section_tab .tab_item.is_selected a span").text().replace(/\s/g, ""),
				prodNm = $(this).parents("li").find(".prd_tit2 .goosNm").text().replace(/\s/g, "");
			GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_상품", "상품_"+prodNm);
		});
		
		$(document).on("click", ".baseBrand .bottom_page.brand_type .prd_list_new li a.no_stoc", function () {
			var tabNm = $(".bottom_page.brand_type .navSection_swiper .section_tab .tab_item.is_selected a span").text().replace(/\s/g, "");
			GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm, "재입고알림");
		});
		
		$(document).on("click", ".baseBrand .bottom_page.brand_type .prd_list_new li .cart a", function () {
			var tabNm = $(".bottom_page.brand_type .navSection_swiper .section_tab .tab_item.is_selected a span").text().replace(/\s/g, "");
			GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm, "장바구니담기");
		});

		$(document).on("click", ".baseBrand .bottom_page.brand_type .prd_list_new li .checkbox.new input[name='goosChk']", function () {
			var tabNm = $(".bottom_page.brand_type .navSection_swiper .section_tab .tab_item.is_selected a span").text().replace(/\s/g, ""),
				prodNm = $(this).parents("li").find(".prd_tit2 .goosNm").text().replace(/\s/g, "");
			if ($(this).is(":checked")){
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_한번에담기_상품", "상품_"+prodNm);
			} else {
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_한번에담기취소_상품", "상품_"+prodNm);
			}
		});

		$(document).on("click", ".baseBrand #searchFilter .section_tab .tab_item a, .filter_popup #filter_tab .section_tab .tab_item a", function () {
			var tabNm = $(".bottom_page.brand_type .navSection_swiper .section_tab .tab_item.is_selected a span").text().replace(/\s/g, ""),
				filtNm = $(".filter_popup #filter_tab .section_tab .tab_item.is_selected a span").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_검색필터", "필터_"+filtNm);
		});

		$(document).on("click", ".filter_popup #filter_swiper .visual_item .filter_chk_item input[type='checkbox'] + label", function () {
			var tabNm = $(".bottom_page.brand_type .navSection_swiper .section_tab .tab_item.is_selected a span").text().replace(/\s/g, ""),
				filtChk = $(this).prev("input").is(":checked"),
				filtTp = $(this).prev("input").attr("name"),
				filtNm = $(this).text().replace(/\s/g, "");
			if (filtChk == true){
				if (filtTp == "shopFilter"){
					GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_쇼핑정보", "상세취소필터_"+filtNm);
				} else if (filtTp == "priceFilter"){
					GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_가격", "상세취소필터_"+filtNm);
				}
			} else {
				if (filtTp == "shopFilter"){
					GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_쇼핑정보", "상세필터_"+filtNm);
				} else if (filtTp == "priceFilter"){
					GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_가격", "상세필터_"+filtNm);
				}
			}
		});

		$(document).on("click", ".baseBrand #searchFilter .section_tab .tab_item a .close_btn", function(e){
			e.stopPropagation();
			var tabNm = $(".bottom_page.brand_type .navSection_swiper .section_tab .tab_item.is_selected a span").text().replace(/\s/g, "");
			if ($(this).attr("onclick") == "searchTabInit(1);"){
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_쇼핑정보", "전체취소");
			} else if ($(this).attr("onclick") == "searchTabInit(2);"){
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_가격", "전체취소");
			}
		});

		var filterBran = 0;
		$(document).on("change", ".filter_popup #filter_swiper .visual_item .price_area_input input", function(){
			filterBran = 1;
		});
		$(document).on("click", ".filter_popup .fix_itme button", function(){
			var tabNm = $(".bottom_page.brand_type .navSection_swiper .section_tab .tab_item.is_selected a span").text().replace(/\s/g, "");
			if ($(this).attr("onclick") == "goosSearchItemFilter('Y');"){
				if(filterBran == 1){
					var stPr = $("#filter_swiper .price_area_input input#priceFilterStr").val(),
						endPr = $("#filter_swiper .price_area_input input#priceFilterEnd").val();
					GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_필터_가격_$"+stPr+"~"+endPr, "검색");
				} else {
					GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_검색필터", "검색");
				}
			} else if ($(this).attr("onclick") == "goosSearchItemInit('N');"){
				GA_Event("click_MO_중문_브랜드상세_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_검색필터", "초기화");
			}
		});
	}
	/* 브랜드관 End */

	/* 대표브랜드관 Start */
	if ($("body").find(".contaner_brand.reprBrand").length){
		var branCd = $(".bottom_top_swiper .brandshop_swiper_bottom .bull_like_area .bull_like").attr("href").replace(/[^0-9]/gi,""),
			branNm = $(".header .header_top .headerTitle").text().replace(/\s/g, "");

		$(document).on("click", ".reprBrand .bottom_top_swiper .brandshop_swiper .visual_item a", function () {
			var bnnrNm = $(this).find(".brandshop_swiper_tit p").not($(".tx3")).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_대표브랜드관_"+branCd, branNm, branNm+"_메인배너", "배너_"+bnnrNm);
		});

		$(document).on("click", ".reprBrand .brandshop_swiper_bottom .brandshop2_swiper .visual_item > a", function () {
			var bnnrNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_대표브랜드관_"+branCd, branNm, branNm+"_중간배너", "배너_"+bnnrNm);
		});
		
		$(document).on("click", ".reprBrand .bottom_page.brand_type .brand_con_all_area .banner_visual .visual_item a", function () {
			var bnnrNm = $(this).find(".banner_tit").text().replace(/\s/g, "");
			GA_Event("click_MO_중문_대표브랜드관_"+branCd, branNm, branNm+"_브랜드행사배너", "배너_"+bnnrNm);
		});

		$(document).on("click", ".reprBrand .bottom_page.brand_type .navSection_swiper .section_tab .tab_item a", function () {
			var tabNm = $(this).find("span").text().replace(/\s/g, "");
			GA_Event("click_MO_중문_대표브랜드관_"+branCd, branNm, branNm+"_탭", "탭_"+tabNm);
		});

		$(document).on("click", ".reprBrand .bottom_page.brand_type .prd_list_new li > a:not(.no_stoc), .reprBrand .bottom_page.brand_type .prd_list_new .prd_tit2 a", function () {
			var tabNm = $(".bottom_page.brand_type .navSection_swiper .section_tab .tab_item.is_selected a span").text().replace(/\s/g, ""),
				prodNm = $(this).parents("li").find(".prd_tit2 .goosNm").text().replace(/\s/g, "");
			GA_Event("click_MO_중문_대표브랜드관_"+branCd, branNm+"_상세탭", branNm+"_상세탭_"+tabNm+"_상품", "상품_"+prodNm);
		});
	}
	/* 대표브랜드관 End */

	// 템플릿관(템플릿확장형)
	/*$(".container.expand .banner_list .swiper-wrapper .banner_item").each(function () {
		$(this).on("click", function () {
			var bnnrName = $(this).find("img").attr("alt");
			var info = $(this).find("img").attr("info").split("__");
			var branCd = info[0];
			var branNm = info[1];
			GA_Event("click_MO_중문_템플릿관_" + branCd, branNm + "_확장형", branNm + "_확장형_메인배너", "배너_" + bnnrName);
		});
	});*/

	// 템플릿관(템플릿기본형)
	/*$(".container.basic .banner_list .swiper-wrapper .banner_item").each(function () {
		$(this).on("click", function () {
			var bnnrName = $(this).find("img").attr("alt");
			var info = $(this).find("img").attr("info").split("__");
			var branCd = info[0];
			var branNm = info[1];
			GA_Event("click_MO_중문_템플릿관_" + branCd, branNm + "_기본형", branNm + "_기본형_메인배너", "배너_" + bnnrName);
		});
	});*/

	/* 명품관 Start */
	// 명품관(에스티로더)
	// 20260420 수정
	if ($("body").find(".esteelauder").length) {
		$(document).on("click", ".esteelauder .elko_header .elko_prefix", function () {
			GA_Event("click_MO_중문_명품관_022901", "에스티로더", "햄버거메뉴", "더보기");
		});

		$(document).on("click", ".esteelauder .elko_header .elko_gnb ul li a", function () {
			var menuNm = $(this).find("span").text().replace(/\s/g, "");
			GA_Event("click_MO_중문_명품관_022901", "에스티로더", "햄버거메뉴", menuNm);
		});

		$(document).on("click", ".esteelauder .elko_header .elko_gnb ul li .sub_wrap a", function () {
			var menuNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_명품관_022901", "에스티로더", "햄버거메뉴", menuNm);
		});
		
		$(document).on("click", ".esteelauder .main_banner ul li a", function () {
			var bnnrName = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_명품관_022901", "에스티로더", "메인배너", bnnrName);
		});

		$(document).on("click", ".esteelauder .main_top_qmenu ul li a", function () {
			var cateName = $(this).children("span").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_022901", "에스티로더", "카테고리메뉴", cateName);
		});

		$(document).on("click", ".esteelauder .main_bestseller .elko_tab_list ul li a", function () {
			var bestCateName = $(this).parents(".main_bestseller").find('.best_tab > ul li.active').text().replace(/\s/g, '');
			var bestProdName = $(this).closest(".rel").find('.prod_name').text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_022901", "에스티로더", "베스트셀러_" +bestCateName ,bestCateName+"_"+bestProdName);
		});

		$(document).on("click", ".esteelauder .main_travel ul li a", function () {
			var prodName = $(this).next(".prod_name").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_022901", "에스티로더", "면세전용상품", prodName);
		});

		$(document).on("click", ".esteelauder .main_collection > ul li a:not(.bctab)", function () {
			var activeIdx = $(".esteelauder .main_collection > ul li").index($(".esteelauder .main_collection > ul li.active"));
			var bestCateName = $(this).closest('li').find('a').eq(activeIdx).text();
			var bestProdName = $(this).text().replace("구매하기", "").trim().replace(/\s/g, '');

			GA_Event("click_MO_중문_명품관_022901", "에스티로더", "베스트셀러 컬렉션_" +bestCateName ,bestCateName+"_"+bestProdName);
		});

	}

	// 명품관(랑콤)
	if ($("body").find(".lancome_header").length) {
		$(document).on("click", ".lancome_header .lancome_header_menu_tab", function () {
			GA_Event("click_MO_중문_명품관_006301", "랑콤", "랑콤_햄버거메뉴", "펼치기");
		});
		$(document).on("click", ".lancome_header .sidebar_close", function () {
			GA_Event("click_MO_중문_명품관_006301", "랑콤", "랑콤_햄버거메뉴", "닫기");
		});
		$(document).on("click", ".lancome_header .sidebar_gnb > li > a", function () {
			var oneDepthsNm = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_006301", "랑콤", "랑콤_햄버거메뉴", "햄버거메뉴_" + oneDepthsNm);
		});
		$(document).on("click", ".lancome_header .sidebar_gnb .gnb_depth2_wrap > li > a", function () {
			var oneDepthsNm = $(this).parents(".gnb_depth2_wrap").parent("li").find(".gnb_depth1").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_006301", "랑콤", "랑콤_햄버거메뉴", "햄버거메뉴_" + oneDepthsNm + "_" + twoDepthsNm);
		});
		$(document).on("click", ".lancome_header .sidebar_gnb .gnb_depth2_wrap .gnb_depth3 > a", function () {
			var oneDepthsNm = $(this).parents(".gnb_depth2_wrap").parent("li").find(".gnb_depth1").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).parent(".gnb_depth3").parent("li").find(".gnb_depth2").text().replace(/\s/g, '');
			var threeDepthsNm = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_006301", "랑콤", "랑콤_햄버거메뉴", "햄버거메뉴_" + oneDepthsNm + "_" + twoDepthsNm + "_" + threeDepthsNm);
		});

		$(document).on("click", "#lancome_homepage_carousel .slick-track .slick-slide a", function () {
			var bnnrName = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_명품관_006301", "랑콤", "랑콤_메인배너", "배너_" + bnnrName);
		});

		$(document).on("click", ".lancome_homepage .lancome_promotion_banner .slick-list .slick-track > a", function () {
			var bnrName = $(this).children("img").attr("alt").replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_006301", "랑콤", "랑콤_중간배너", "배너_" + bnrName);
		});

		$(document).on("click", ".lancome_homepage .lancome_homepage_product_carousel .slick-list .slick-track .items .lancome_homepage_product_container > .lancome_homepage_product_img", function () {
			var prdName = $(this).parent().find(".lancome_homepage_prodouct_name").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_006301", "랑콤", "랑콤_중간컨텐츠_상품", "상품_" + prdName);
		});

		$(document).on("click", ".lancome_homepage .lancome_homepage_product_carousel .slick-list .slick-track .items .lancome_homepage_product_container .lancome_homepage_product_btns > .lancome_plp_product_btn", function () {
			if ($(this).is(".lancome_plp_product_addToCartbtn") == true) {
				GA_Event("click_MO_중문_명품관_006301", "랑콤", "랑콤_중간컨텐츠_상품", "장바구니");
			} else if ($(this).is(".lancome_plp_product_buybtn") == true) {
				GA_Event("click_MO_중문_명품관_006301", "랑콤", "랑콤_중간컨텐츠_상품", "바로구매");
			} else if ($(this).is(".sold-out") == true) {
				GA_Event("click_MO_중문_명품관_006301", "랑콤", "랑콤_중간컨텐츠_상품", "재입고알림");
			};
		});

		$(document).on("click", ".lancome_bottom_carousel .lancome_bottom_carousel_btn > a", function () {
			prdName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_006301", "랑콤", "랑콤_베스트셀러_상품", "상품_" + prdName);
		});

		$(document).on("click", "body .btn_cos_face", function () {
			GA_Event("click_MO_중문_명품관_006301", "랑콤", "랑콤", "AR메이크업");
		});
	};

	// 명품관(클라랑스)
	if ($("body").find(".container.clarins").length) {
		$(document).on("click", ".clarins-gnb:not(.is-opened) > ul > .clarins-accordion > a", function () {
			GA_Event("click_MO_중문_명품관_005701", "클라랑스", "클라랑스_카테고리메뉴", "카테고리전체보기");
		});
		$(document).on("click", ".clarins-gnb.is-opened > ul > .clarins-accordion > a", function () {
			GA_Event("click_MO_중문_명품관_005701", "클라랑스", "클라랑스_카테고리메뉴", "카테고리전체보기닫기");
		});
		$(document).on("click", ".clarins-gnb > ul > .clarins-accordion > ul > li > a", function () {
			var oneDepthsNm = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_005701", "클라랑스", "클라랑스_카테고리메뉴", "카테고리메뉴_" + oneDepthsNm);
		});
		$(document).on("click", ".clarins-gnb > ul > .clarins-accordion > ul > .clarins-accordion > ul > li:not('.clarins-accordion') > a", function () {
			var oneDepthsNm = $(this).parent("li").parent("ul").parent(".clarins-accordion").children("a").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_005701", "클라랑스", "클라랑스_카테고리메뉴", "카테고리메뉴_" + oneDepthsNm + "_" + twoDepthsNm);
		});
		$(document).on("click", ".clarins-gnb > ul > .clarins-accordion > ul > .clarins-accordion > ul > .clarins-accordion > ul > li > a", function () {
			var oneDepthsNm = $(this).parent("li").parent("ul").parent(".clarins-accordion").parent("ul").parent(".clarins-accordion").children("a").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).parent("li").parent("ul").parent(".clarins-accordion").children("a").text().replace(/\s/g, '');
			var threeDepthsNm = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_005701", "클라랑스", "클라랑스_카테고리메뉴", "카테고리메뉴_" + oneDepthsNm + "_" + twoDepthsNm + "_" + threeDepthsNm);
		});

		$(document).on("click", ".clarins-mainBanner .swiper-slide a", function () {
			var bnnrName = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_명품관_005701", "클라랑스", "클라랑스_메인배너", "배너_" + bnnrName);
		});

		$(document).on("click", ".clarins .clarins-card-items .clarins-item a", function () {
			cateName = $(this).parent(".clarins-item").find(".clarins-meta .clarins-name").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_005701", "클라랑스", "클라랑스_카테고리", "카테고리_" + cateName);
		});

		$(document).on("click", ".clarins .clarins-slider-1 .clarins-pdt-items .clarins-item a", function () {
			prdName = $(this).parents(".clarins-item").find(".clarins-meta .clarins-name").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_005701", "클라랑스", "클라랑스_신제품_상품", "상품_" + prdName);
		});
		$(document).on("click", ".clarins .clarins-slider-1 .clarins-btn-more", function () {
			GA_Event("click_MO_중문_명품관_005701", "클라랑스", "클라랑스_신제품", "신제품더보기");
		});

		$(document).on("click", ".clarins .clarins-slider-2 .clarins-pdt-items .clarins-item a", function () {
			prdName = $(this).parents(".clarins-item").find(".clarins-meta .clarins-name").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_005701", "클라랑스", "클라랑스_베스트셀러_상품", "상품_" + prdName);
		});
		$(document).on("click", ".clarins .clarins-slider-2 .clarins-btn-more", function () {
			GA_Event("click_MO_중문_명품관_005701", "클라랑스", "클라랑스_베스트셀러", "베스트셀러더보기");
		});

		$(document).on("click", ".clarins .clarins-footerBanner a", function () {
			var bnrName = $(this).attr("title").replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_005701", "클라랑스", "클라랑스_하단배너", "배너_" + bnrName);
		});
	};

	// 명품관(겔랑)
	if ($("body").find(".container.guerlain").length) {
		$(document).on("click", ".guerlain-header .guerlain-btn-menu", function () {
			GA_Event("click_MO_중문_명품관_005601", "겔랑", "겔랑_햄버거메뉴", "펼치기");
		});
		$(document).on("click", ".guerlain-header .guerlain-gnb .guerlain-btn-close", function () {
			GA_Event("click_MO_중문_명품관_005601", "겔랑", "겔랑_햄버거메뉴", "닫기");
		});
		$(document).on("click", ".guerlain-header .guerlain-gnb .gnb-body > ul > li > a", function () {
			if($(this).parent().find("ul").length < 1){
				var oneDepthsNm = $(this).text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_005601", "겔랑", "겔랑_햄버거메뉴", "햄버거메뉴_" + oneDepthsNm);
			};
		});
		$(document).on("click", ".guerlain-header .guerlain-gnb .gnb-body > ul > li > ul > li > ul > li > a", function () {
			var oneDepthsNm = $(this).parent("li").parent("ul").parent("li").parent("ul").parent("li").children("a").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).parent("li").parent("ul").parent("li").children("a").text().replace(/\s/g, '');
			var threeDepthsNm = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_005601", "겔랑", "겔랑_햄버거메뉴", "햄버거메뉴_" + oneDepthsNm + "_" + twoDepthsNm + "_" + threeDepthsNm);
		});

		$(document).on("click", ".guerlain-wrap > .guerlain-mainBanner .swiper-slide a", function () {
			var bnnrName = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_명품관_005601", "겔랑", "겔랑_메인배너", "배너_" + bnnrName);
		});

		$(document).on("click", ".guerlain .guerlain-mainBanner .guerlain-meta .guerlain-link-more-cta a.guerlain-link-more", function () {
			GA_Event("click_MO_중문_명품관_005601", "겔랑", "겔랑_중간배너", "배너_브랜드스토리_더보기");
		});

		$(document).on("click", ".guerlain .guerlain-container .guerlain-card-items .guerlain-item .guerlain-link-more-cta a.guerlain-link-more", function () {
			var cateName = $(this).parents(".guerlain-meta").find(".guerlain-name").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_005601", "겔랑", "겔랑_카테고리", "카테고리_" + cateName);
		});

		$(document).on("click", ".guerlain .guerlain-container .guerlain-slider-1 .guerlain-pdt-items .guerlain-item > a", function () {
			var prdName = $(this).parents(".guerlain-item").find(".guerlain-thumb img").attr("alt").replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_005601", "겔랑", "겔랑_신제품_상품", "상품_" + prdName);
		});

		$(document).on("click", ".guerlain .guerlain-container .guerlain-slider-2 .guerlain-pdt-items .guerlain-item > a", function () {
			var prdName = $(this).parents(".guerlain-item").find(".guerlain-thumb img").attr("alt").replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_005601", "겔랑", "겔랑_베스트셀러_상품", "상품_" + prdName);
		});

		$(document).on("click", "body .btn_cos_face", function () {
			GA_Event("click_MO_중문_명품관_005601", "겔랑", "겔랑", "AR메이크업");
		});
	};

	// 명품관(톰포드)
	if ($("body").find(".container.tomford").length) {
		$(document).on("click", ".tomford .header_bar .top_nav_header .main_nav .nav_btn_container", function () {
			if ($(this).hasClass("nav_btn_active") == true){
				GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_햄버거메뉴", "펼치기");
			} else {
				GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_햄버거메뉴", "닫기");
			}
		});
		$(document).on("click", ".tomford .nav_menu .topnav > li > a:not('.burger_topnav_first')", function () {
			var oneDepthsNm = $(this).children().text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_카테고리메뉴", "카테고리메뉴_" + oneDepthsNm);
		});
		$(document).on("click", ".tomford .nav_menu .topnav > .nav_tri > ul > .nav_tri > ul > li > a", function () {
			var oneDepthsNm = $(this).parent("li").parent("ul").parent(".nav_tri").find(".burger_topnav_second").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).children("span").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_카테고리메뉴", "카테고리메뉴_" + oneDepthsNm + "_" + twoDepthsNm);
		});

		$(document).on("click", ".tomford .home-slider .slick-slide a", function () {
			var bnnrName = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_메인배너", "배너_" + bnnrName);
		});

		$(document).on("click", ".tomford .luxury_area .home_cta > .hp_cta_cap", function () {
			var cateName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_카테고리메뉴", "카테고리메뉴_" + cateName);
		});

		$(document).on("click", ".tomford .luxury_area .home_cta .itemUnitTf .prod_img_link", function () {
			var cateName = $(this).parents(".home_cta").find(".hp_cta_cap").text().replace(/\s/g, ''), prdName = $(this).children("img").attr("alt").replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_" + cateName + "_상품", "상품_" + prdName);
		});
		$(document).on("click", ".tomford .luxury_area .home_cta .itemUnitTf .prod_name_link", function () {
			var cateName = $(this).parents(".home_cta").find(".hp_cta_cap").text().replace(/\s/g, ''), prdName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_" + cateName + "_상품", "상품_" + prdName);
		});
		$(document).on("click", ".tomford .luxury_area .home_cta .itemUnitTf .prod_btm_item > a", function () {
			var cateName = $(this).parents(".home_cta").find(".hp_cta_cap").text().replace(/\s/g, ''), prdName = $(this).parents(".itemUnitTf").find(".prod_name_link").text().replace(/\s/g, '');
			if ($(this).attr("onclick").includes("goAddCart") == true) {
				// GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_" + cateName + "_상품", "장바구니");
				GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_" + cateName + "_상품", "상품_" + prdName);
			} else if ($(this).attr("onclick").includes("goAddBuy") == true) {
				// GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_" + cateName + "_상품", "바로구매");
				GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_" + cateName + "_상품", "상품_" + prdName);
			} else if ($(this).attr("onclick").includes("addAginRecpNtc") == true) {
				// GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_" + cateName + "_상품", "재입고알림");
				GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_" + cateName + "_상품", "상품_" + prdName);
			};
		});

		$(document).on("click", ".tomford .luxury_area .hp_inner_item.hp_accordion > .topnav.home_second_topnav > .nav_tri > ul > li > a", function () {
			var oneDepthsNm = $(this).parent("li").parent("ul").parent(".nav_tri").children(".collapse_title").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).children("span").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티_카테고리메뉴", "카테고리메뉴_" + oneDepthsNm + "_" + twoDepthsNm);
		});

		$(document).on("click", "body .btn_cos_face", function () {
			GA_Event("click_MO_중문_명품관_027102", "톰포드뷰티", "톰포드뷰티", "AR메이크업");
		});
	};

	// 명품관(라메르)
	// 20260420 수정
	if ($("body").find(".container.lamer").length) {
		$(document).on("click", ".lamer .elco_header .elco_prefix", function () {
			GA_Event("click_MO_중문_명품관_025301", "라메르", "햄버거메뉴", "더보기");
		});

		$(document).on("click", ".lamer .elco_header .elco_gnb ul li a", function () {
			var menuNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_명품관_025301", "라메르", "햄버거메뉴", menuNm);
		});

		$(document).on("click", ".lamer .main_banner ul li a", function () {
			var bnnrName = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_명품관_025301", "라메르", "메인배너", bnnrName);
		});

		$(document).on("click", ".lamer .main_top_qmenu ul li a", function () {
			var cateName = $(this).children("span").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025301", "라메르", "카테고리메뉴", cateName);
		});

		$(document).on("click", ".lamer .main_travel ul li a", function () {
			var prodName = $(this).next(".prod_name").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025301", "라메르", "면세전용상품", prodName);
		});

		$(document).on("click", ".main_moisturizer .rel ul li a", function (e) {
			var idx = $(this).closest("li").index();
			var bestProdName = $(this).closest(".rel").find('.tab_btn_area a').eq(idx).attr("alt");
			if (bestProdName) {
				bestProdName = bestProdName.replace(/\s/g, '');
			}
			GA_Event("click_MO_중문_명품관_025301", "라메르", "라메르_모이스춰라이저", "모이스춰라이저_" + bestProdName);
		});

		$(document).on("click", ".main_treatment .rel ul li a", function (e) {
			var idx = $(this).closest("li").index();
			var bestProdName = $(this).closest(".rel").find('.tab_btn_area a').eq(idx).attr("alt");
			if (bestProdName) {
				bestProdName = bestProdName.replace(/\s/g, '');
			}
			GA_Event("click_MO_중문_명품관_025301", "라메르", "라메르_워터리 로션", "워터리 로션_" + bestProdName);
		});

		$(document).on("click", ".main_concentrate .rel ul li a", function (e) {
			var idx = $(this).closest("li").index();
			var bestProdName = $(this).closest(".rel").find('.tab_btn_area a').eq(idx).attr("alt");
			if (bestProdName) {
				bestProdName = bestProdName.replace(/\s/g, '');
			}
			GA_Event("click_MO_중문_명품관_025301", "라메르", "라메르_컨센트레이트 컬렉션", "컨센트레이트 컬렉션_" + bestProdName);
		});

		$(document).on("click", ".lamer .main_lamerstory .rel a", function () {
			var btnName = $(this).find("img").attr('alt').replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025301", "라메르", "라메르 스토리", '라메르 스토리_자세히보기');
		});

		$(document).on("click", ".lamer .main_category .tab_btn_area a", function () {
			var btnName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025301", "라메르", "라메르 패밀리", "라메르 패밀리_"+btnName);
		});

		$(document).on("click", ".lamer .main_category .rel > ul li .cat_prod_list a", function () {
			var prodName = $(this).find('img').attr('alt');
			var activeIdx = $(this).closest('li').index();
			var cateName = $(this).parents('.main_category').find('.tab_btn_area a').eq(activeIdx).text();

			GA_Event("click_MO_중문_명품관_025301", "라메르", "라메르 패밀리_"+cateName, "라메르 패밀리_"+cateName+"_"+prodName);
		});

	};

	// 명품관(조말론)
	if ($("body").find(".container.jomalone").length) {
		$(document).on("click", ".jomalone .header_bar .top_nav_header .main_nav .nav_btn_container", function () {
			if ($(this).hasClass("nav_btn_active") == true){
				GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_햄버거메뉴", "펼치기");
			} else {
				GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_햄버거메뉴", "닫기");
			}
		});
		$(document).on("click", ".jomalone .header_bar .topnav > li > a", function () {
			var oneDepthsNm = $(this).children().text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_햄버거메뉴", "햄버거메뉴_" + oneDepthsNm);
		});
		$(document).on("click", ".jomalone .header_bar .topnav .nav_tri > ul > .burger_topnav_second > ul > li > a", function () {
			var oneDepthsNm = $(this).parent("li").parent("ul").parent(".burger_topnav_second").children("a").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).children("span").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_햄버거메뉴", "햄버거메뉴_" + oneDepthsNm + "_" + twoDepthsNm);
		});
		$(document).on("click", ".jomalone .header_bar .topnav > .nav_tri > ul > li:not('.burger_topnav_second') > a", function () {
			var oneDepthsNm = $(this).parent("li").parent("ul").parent(".nav_tri").children("a").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).children("span").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_햄버거메뉴", "햄버거메뉴_" + oneDepthsNm + "_" + twoDepthsNm);
		});
		$(document).on("click", ".jomalone .header_bar .topnav > .nav_tri > ul > .nav_tri > ul >.nav_tri > ul > li > a", function () {
			var oneDepthsNm = $(this).parent("li").parent("ul").parent(".nav_tri").parent("ul").parent(".nav_tri").find(".burger_topnav_second").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).parent("li").parent("ul").parent(".nav_tri").children("a").text().replace(/\s/g, '');
			var threeDepthsNm = $(this).children("span").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_햄버거메뉴", "햄버거메뉴_" + oneDepthsNm + "_" + twoDepthsNm + "_" + threeDepthsNm);
		});

		$(document).on("click", ".jomalone .home-slider .slick-slide a", function () {
			var bnnrName = $(this).find("img").attr("alt");
			GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_메인배너", "배너_" + bnnrName);
		});

		$(document).on("click", ".jomalone .luxury_area .home_cta > .hp_cta_cap", function () {
			var cateName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_카테고리메뉴", "카테고리메뉴_" + cateName);
		});

		$(document).on("click", ".jomalone .luxury_area .home_cta .itemUnitEk .prod_img_link", function () {
			var cateName = $(this).parents(".home_cta").find(".hp_cta_cap").text().replace(/\s/g, ''), prdName = $(this).children("img").attr("alt").replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_" + cateName + "_상품", "상품_" + prdName);
		});
		$(document).on("click", ".jomalone .luxury_area .home_cta .itemUnitEk .prod_name_link", function () {
			var cateName = $(this).parents(".home_cta").find(".hp_cta_cap").text().replace(/\s/g, ''), prdName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_" + cateName + "_상품", "상품_" + prdName);
		});
		$(document).on("click", ".jomalone .luxury_area .home_cta .itemUnitEk .prod_btm_item > a", function () {
			var cateName = $(this).parents(".home_cta").find(".hp_cta_cap").text().replace(/\s/g, ''), prdName = $(this).parents(".itemUnitEk").find(".prod_name_link").text().replace(/\s/g, '');
			if ($(this).attr("onclick").includes("goAddCart") == true) {
				// GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_" + cateName + "_상품", "장바구니");
				GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_" + cateName + "_상품", "상품_" + prdName);
			} else if ($(this).attr("onclick").includes("goAddBuy") == true) {
				// GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_" + cateName + "_상품", "바로구매");
				GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_" + cateName + "_상품", "상품_" + prdName);
			} else if ($(this).attr("onclick").includes("addAginRecpNtc") == true) {
				// GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_" + cateName + "_상품", "재입고알림");
				GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_" + cateName + "_상품", "상품_" + prdName);
			};
		});

		$(document).on("click", ".jomalone .luxury_area .hp_inner_item.hp_accordion > .topnav.home_second_topnav > .nav_tri > ul > li:not('.nav_tri') > a", function () {
			var oneDepthsNm = $(this).parent("li").parent("ul").parent(".nav_tri").children("a").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).children("span").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_카테고리메뉴", "카테고리메뉴_" + oneDepthsNm + "_" + twoDepthsNm);
		});
		$(document).on("click", ".jomalone .luxury_area .hp_inner_item.hp_accordion > .topnav.home_second_topnav > .nav_tri > ul > .nav_tri > ul > li > a", function () {
			var oneDepthsNm = $(this).parent("li").parent("ul").parent(".nav_tri").parent("ul").parent(".nav_tri").children(".collapse_title").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).parent("li").parent("ul").parent(".nav_tri").children("a").text().replace(/\s/g, '');
			var threeDepthsNm = $(this).children("span").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_카테고리메뉴", "카테고리메뉴_" + oneDepthsNm + "_" + twoDepthsNm + "_" + threeDepthsNm);
		});
		$(document).on("click", ".jomalone .luxury_area .hp_inner_item.hp_accordion > .topnav.home_second_topnav > li > a.collapse_title2", function () {
			var oneDepthsNm = $(this).parents(".home_cta").children(".hp_cta_cap").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).children().text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던_카테고리메뉴", "카테고리메뉴_" + oneDepthsNm + "_" + twoDepthsNm);
		});

		$(document).on("click", "body .btn_cos_face", function () {
			GA_Event("click_MO_중문_명품관_025501", "조말론런던", "조말론런던", "AR메이크업");
		});
	};

	// 명품관(MAC)
	// 2026-05-22 MAC MO 명품관 리뉴얼 GA 태깅
	if($("body").find(".wrapper.mac").length){

		$(document).on("click",".elko_prefix",function(){
			GA_Event("click_MO_중문_명품관_025401","맥","햄버거메뉴","더보기");
		});

		$(document).on("click", ".elko_gnb a", function () {
			var $this = $(this);
			var $depth1Li = $this.closest(".elko_gnb > ul > li");
			var depth1 = $.trim($depth1Li.children("a").first().text());
			var areaName = "햄버거메뉴_" + depth1;
			var buttonName = "";            
			var isTargetClick = false; 

			var $subGroup = $this.closest(".sub_group");
			var hasSubCat = $subGroup.find(".sub_cat").length > 0;

			// 3뎁스 (.sub_cat 존재)
			if ($subGroup.length && hasSubCat) {
				var depth2 = $.trim($subGroup.find(".sub_cat").first().text());

				if ($this.hasClass("sub_cat")) { // 2뎁스 클릭한 경우
					buttonName = depth2;
				} else {
					var depth3 = $.trim($this.text());
					buttonName = depth2 + "_" + depth3;
				}
				isTargetClick = true; 
			}
			// 2뎁스 (.sub_cat 없음)
			else if ($subGroup.length && !hasSubCat && $this.closest("ul").length) {
				var depth2 = $.trim($this.text());
				buttonName = depth2;
				isTargetClick = true;
			}
			// 1뎁스
			else if (!$depth1Li.hasClass("sub")) {
				buttonName = "더보기";
				isTargetClick = true;
			}

			if (isTargetClick) {
				GA_Event("click_MO_중문_명품관_026401", "맥", areaName, buttonName);
			}
		});

		$(document).on("click",".main_top_qmenu ul li a",function(){
			var categoryName=$(this).children().text().replace(/\s/g,'');
			GA_Event("click_MO_중문_명품관_025401","맥","카테고리메뉴", categoryName);
		});

		$(document).on("click",".main_banner .swiper-wrapper .swiper-slide a",function(){
			var bnnrName=$(this).find("img").attr("alt");
			GA_Event("click_MO_중문_명품관_025401","맥","메인배너", bnnrName);
		});

		$(document).on("click",".main_bestseller .elko_tab_list .swiper-wrapper .swiper-slide a",function () {
				var $this = $(this);
				var categoryName = $.trim($this.closest(".main_bestseller").find(".best_tab > ul li.active").text());
				var prdName = $.trim($this.closest(".swiper-slide").find(".prod_name").text().replace(/\s+/g, ""));

				GA_Event("click_MO_중문_명품관_026401","맥", categoryName, prdName);
			}
		);

		$(document).on("click",".main_promotion ul li a",function(){
			var prdName=$(this).find('img').attr('title').replace(/\s/g,'');
			GA_Event("click_MO_중문_명품관_025401","맥","이 달의 추천 제품", prdName);
		});

		$(document).on("click",".main_static_tab .tab_btn_area a",function(){
			var categoryName=$(this).text().replace(/\s/g,'');
			GA_Event("click_MO_중문_명품관_025401","맥","머스트 해브 아이템", categoryName);
		});

		$(document).on("click",".main_static_tab ul li.active .rel a",function(){
			var $this = $(this);
			var prdName = $this.text().replace("立即购买", "").replace(/\s/g, '');
			var activeIdx = $this.closest("li").index();
			var categoryName = $.trim($this.closest(".main_static_tab").find(".tab_btn_area a").eq(activeIdx).text());
			GA_Event("click_MO_중문_명품관_025401","맥","머스트 해브 아이템_"+categoryName , prdName);
		});
	}

	// 명품관(오리진스)
	if ($("body").find(".container.origins").length) {
		$(document).on("click", ".origins .header_bar .top_nav_header .main_nav .nav_btn_container", function () {
			if ($(this).hasClass("nav_btn_active") == true){
				GA_Event("click_MO_중문_명품관_026401", "오리진스", "오리진스_햄버거메뉴", "펼치기");
			} else {
				GA_Event("click_MO_중문_명품관_026401", "오리진스", "오리진스_햄버거메뉴", "닫기");
			}
		});
		$(document).on("click", ".origins .header_bar .topnav > li > a:not('.burger_topnav_first')", function () {
			var oneDepthsNm = $(this).children().text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_026401", "오리진스", "오리진스_햄버거메뉴", "햄버거메뉴_" + oneDepthsNm);
		});
		$(document).on("click", ".origins .header_bar .topnav > li.nav_tri > ul > li > a", function () {
			var oneDepthsNm = $(this).parents(".nav_tri").children(".burger_topnav_first").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).children().text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_026401", "오리진스", "오리진스_햄버거메뉴", "햄버거메뉴_" + oneDepthsNm + "_" + twoDepthsNm);
		});

		$(document).on("click", ".origins .home-slider .slick-slide a", function () {
			var bnnrName = $(this).find("img").attr("alt");
			GA_Event("click_MO_중문_명품관_026401", "오리진스 ", "오리진스_메인배너", "배너_" + bnnrName);
		});

		$(document).on("click", ".origins .luxury_area .home_cta .itemUnitEk .prod_btm_item > a", function () {
			var cateName = $(this).parents(".home_cta").find(".hp_cta_cap").text().replace(/\s/g, ''), prdName = $(this).parents(".itemUnitEk").find(".prod_name_link").text().replace(/\s/g, '');
			if ($(this).attr("onclick").includes("goAddCart") == true) {
				// GA_Event("click_MO_중문_명품관_026401", "오리진스", "오리진스_" + cateName + "_상품", "장바구니");
				GA_Event("click_MO_중문_명품관_026401", "오리진스", "오리진스_" + cateName + "_상품", "상품_" + prdName);
			} else if ($(this).attr("onclick").includes("goAddBuy") == true) {
				// GA_Event("click_MO_중문_명품관_026401", "오리진스", "오리진스_" + cateName + "_상품", "바로구매");
				GA_Event("click_MO_중문_명품관_026401", "오리진스", "오리진스_" + cateName + "_상품", "상품_" + prdName);
			} else if ($(this).attr("onclick").includes("addAginRecpNtc") == true) {
				// GA_Event("click_MO_중문_명품관_026401", "오리진스", "오리진스_" + cateName + "_상품", "재입고알림");
				GA_Event("click_MO_중문_명품관_026401", "오리진스", "오리진스_" + cateName + "_상품", "상품_" + prdName);
			};
		});

		$(document).on("click", ".origins .luxury_area .home_cta > .hp_cta_cap", function () {
			var cateName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_026401", "오리진스", "오리진스_카테고리메뉴", "카테고리메뉴_" + cateName);
		});

		$(document).on("click", ".origins .luxury_area .home_cta5 .hp_inner_item.hp_accordion > .topnav.home_second_topnav > li > a", function () {
			var oneDepthsNm = $(this).parents(".home_cta").children(".hp_cta_cap").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).children(".text_title").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_026401", "오리진스", "오리진스_카테고리메뉴", "카테고리메뉴_" + oneDepthsNm + "_" + twoDepthsNm);
		});
		$(document).on("click", ".origins .luxury_area .home_cta3 .hp_inner_item.hp_accordion > .topnav.home_second_topnav > li > a", function () {
			var oneDepthsNm = $(this).parents(".home_cta").children(".hp_cta_cap").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).children(".text_title").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_026401", "오리진스", "오리진스_카테고리메뉴", "카테고리메뉴_" + oneDepthsNm + "_" + twoDepthsNm);
		});

		$(document).on("click", "body .btn_cos_face", function () {
			GA_Event("click_MO_중문_명품관_026401", "오리진스", "오리진스", "AR메이크업");
		});
	};

	// 명품관(디올)
	if ($("body").find(".container.dior").length) {
		$(document).on("click", ".menu-list .list-1depth .list-2depth > li > a", function () {
			var oneDepthsNm = $(this).parents(".list-2depth").parent("li").children("p").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_048801", "디올", "디올_카테고리메뉴", "카테고리메뉴_" + oneDepthsNm + "_" + twoDepthsNm);
		});
		$(document).on("click", ".menu-list .list-1depth .list-2depth .list-3depth > li > a", function () {
			var oneDepthsNm = $(this).parents(".list-2depth").parent("li").children("p").text().replace(/\s/g, '');
			var twoDepthsNm = $(this).parents(".list-3depth").parent("li").children("p").text().replace(/\s/g, '');
			var threeDepthsNm = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_048801", "디올", "디올_카테고리메뉴", "카테고리메뉴_" + oneDepthsNm + "_" + twoDepthsNm + "_" + threeDepthsNm);
		});
		
		$(document).on("click", ".dior .main-index-swiper .swiper-slide", function () {
			var bnnrName = $(this).find("img").attr("alt");
			GA_Event("click_MO_중문_명품관_048801", "디올", "디올_메인배너", "배너_" + bnnrName);
		});
		
		$(document).on("click", ".container.dior .dior-wrapper .main-new.dior-pro-list ul > li > a", function () {
			prdName = $(this).children("dl").children("dt").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_048801", "디올", "디올_신제품_상품", "상품_" + prdName);
		});
		$(document).on("click", ".container.dior .dior-wrapper .main-best.dior-pro-list ul > li > a", function () {
			prdName = $(this).children("dl").children("dt").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_048801", "디올", "디올_베스트셀러_상품", "상품_" + prdName);
		});

		$(document).on("click", ".container.dior .mpp-product.dior-pro-list .dior-wrapper ul > li > a", function () {
			var cateName = $(".mpp-product > .title").text().replace(/\s/g, ''), prdName = $(this).children("dl").children("dt").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_048801", "디올", "디올_" + cateName + "_상품", "상품_" + prdName);
		});

		$(document).on("click", "body .btn_cos_face", function () {
			GA_Event("click_MO_중문_명품관_048801", "디올", "디올", "AR메이크업");
		});
	};


    /** S : 2023-07-05 추가 **/
	// 명품관 - 입생로랑(007901)
	if ($("body").find("#ysl-wrap").length) {
		//GNB - depth01
		$(document).on("click", "#ysl-wrap #ysl-header .menu-list-ysl > ul > li > a:not('.ico_depth')", function () {
			var menu1stName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_007901", "입생로랑", "입생로랑_카테고리메뉴", "카테고리메뉴_" + menu1stName);
		});
		//GNB - depth02
		$(document).on("click", "#ysl-wrap #ysl-header .menu-list-ysl .sub-menu-list ul.dep2_wrap > li > a", function () {
			var menu1stName = $(this).parent().parent().parent().parent().find("a:not('.ico_depth')").eq(0).text().replace(/\s/g, '');
			var menu2ndName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_007901", "입생로랑", "입생로랑_카테고리메뉴", "카테고리메뉴_" + menu1stName + "_" + menu2ndName);
		});
		//GNB - depth03
		$(document).on("click", "#ysl-wrap #ysl-header .menu-list-ysl .sub-menu-list ul.dep3_wrap > li > a", function () {
			var menu1stName = $(this).parent().parent().parent().parent().parent().parent().parent().find("a:not('.ico_depth')").eq(0).text().replace(/\s/g, '');
			var menu2ndName = $(this).parent().parent().parent().parent().find("a").eq(0).text().replace(/\s/g, '');                    
			var menu3rdName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_007901", "입생로랑", "입생로랑_카테고리메뉴", "카테고리메뉴_" + menu1stName + "_" + menu2ndName + "_" + menu3rdName);
		});
		//배너 - 메인배너
		$(document).on("click", "#ysl-wrap #content .slide_box .slick-slide .img_box a", function () {
			var bnrName = $(this).find("img").attr("alt").replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_007901", "입생로랑", "입생로랑_메인배너", "배너_" + bnrName);
		});                
		//카테고리
		$(document).on("click", "#ysl-wrap #content .box2 .con_wrap .slick-slide a", function () {
			var ctgName = $(this).parent().find("span").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_007901", "입생로랑", "입생로랑_카테고리", "카테고리_" + ctgName);
		});
		$(document).on("click", "#ysl-wrap #content .img_bnr_box .con_box2:first-child a", function () {
			var ctgName = $(this).parent().find("span").text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_007901", "입생로랑", "입생로랑_카테고리", "카테고리_" + ctgName);
		});
		//상품 - 베스트셀러 (선처리 완료)
	};


	// 명품관 - 헬레나루빈스타인(007401)
	if ($("body").find(".container.helena").length) {
		//GNB - depth01
		$(document).on("click", "#hr-wrap #hr-header .menu-list-hr > ul > li > a", function () {
			var menu1stName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_007401", "헬레나루빈스타인", "헬레나루빈스타인_카테고리메뉴", "카테고리메뉴_" + menu1stName);
		});
		//GNB - depth02
		$(document).on("click", "#hr-wrap #hr-header .menu-list-hr .sub-menu-list ul.dep2_wrap > li > a", function () {
			var menu1stName = $(this).parent().parent().parent().parent().find("a").eq(0).text().replace(/\s/g, '');
			var menu2ndName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_007401", "헬레나루빈스타인", "헬레나루빈스타인_카테고리메뉴", "카테고리메뉴_" + menu1stName + "_" + menu2ndName);
		});
		//GNB - depth03
		$(document).on("click", "#hr-wrap #hr-header .menu-list-hr .sub-menu-list ul.dep3_wrap > li > a", function () {
			var menu1stName = $(this).parent().parent().parent().parent().parent().parent().parent().find("a").eq(0).text().replace(/\s/g, '');
			var menu2ndName = $(this).parent().parent().parent().parent().find("a").eq(0).text().replace(/\s/g, '');                    
			var menu3rdName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_007401", "헬레나루빈스타인", "헬레나루빈스타인_카테고리메뉴", "카테고리메뉴_" + menu1stName + "_" + menu2ndName + "_" + menu3rdName);
		});
		//배너 - 메인배너
		$(document).on("click", "#hr-wrap #main-hr .slide_box .slick-slide .img_box a", function () {
			var bnrName = $(this).find("img").attr("alt").replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_007401", "헬레나루빈스타인", "헬레나루빈스타인_메인배너", "배너_" + bnrName);
		});
		//배너 - 중간배너
		$(document).on("click", "#hr-wrap #main-hr .bnr_conts_wrap .img_bnr_box.type_brand a", function () {
			var bnrName = $(this).find("img").attr("alt").replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_007401", "헬레나루빈스타인", "헬레나루빈스타인_중간배너", "배너_" + bnrName);
		});
		//카테고리
		$(document).on("click", "#hr-wrap #main-hr .bnr_conts_wrap .img_bnr_box.type_story a", function () {
			var ctgName = $(this).find("img").attr("alt").replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_007401", "헬레나루빈스타인", "헬레나루빈스타인_카테고리", "카테고리_" + ctgName);
		});
		//상품 - 베스트셀러 (선처리 완료)
	};


	// 명품관 - 아베다(026201)
	if ($("body").find(".container.aveda").length) {
		//GNB - depth01
		$(document).on("click", ".aveda .top_fixrow .nav_menu > ul.topnav > li > a", function () {
			if($(this).hasClass('burger_topnav_first')) {
				var menu1stName = $(this).find('span').eq(1).text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026201", "아베다", "아베다_카테고리메뉴", "카테고리메뉴_" + menu1stName);
			}
			else{
				var menu1stName = $(this).find('span').eq(0).text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026201", "아베다", "아베다_카테고리메뉴", "카테고리메뉴_" + menu1stName);
			}
		});
		//GNB - depth02
		$(document).on("click", ".aveda .top_fixrow .nav_menu > ul.topnav > li > ul > li > a", function () {
			var menu1stName = $(this).parent().parent().parent().find('a').eq(0).find('span').eq(1).text().replace(/\s/g, '');
			var menu2ndName = $(this).find('span').text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_026201", "아베다", "아베다_카테고리메뉴", "카테고리메뉴_" + menu1stName + "_" + menu2ndName);
		});
		//배너 - 메인배너
		$(document).on("click", ".aveda .luxury_area .slider_container .slick-slide a", function () {
			var bnrName = $(this).find("img").attr("alt").replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_026201", "아베다", "아베다_메인배너", "배너_" + bnrName);
		});
		//카테고리 - depth01
		$(document).on("click", ".aveda .luxury_area .main_menu_list .home_cta > a", function () {
			var ctg1stName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_026201", "아베다", "아베다_카테고리", "카테고리_" + ctg1stName);
		});
		//카테고리 - depth02
		$(document).on("click", ".aveda .luxury_area .main_menu_list .home_cta .hp_inner_item ul li a", function () {
			var ctg1stName = $(this).parents('.home_cta').find('a').eq(0).text().replace(/\s/g, '');
			var ctg2ndName = $(this).find('.text_title').text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_026201", "아베다", "아베다_카테고리", "카테고리_" + ctg1stName + "_" + ctg2ndName);
		});
		//상품 - 베스트셀러
		$(document).on("click", ".aveda .luxury_area .main_menu_list .home_cta1 .hp_inner_item .slick-slide a", function () {
			var btnChecker = $(this);
			if(btnChecker.hasClass('prod_img_link')){
				var prdName = $(this).find("img").attr("alt").replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026201", "아베다", "아베다_베스트셀러_상품", "상품_" + prdName);
			}
			else if(btnChecker.hasClass('prod_name_link')){
				var prdName = $(this).text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026201", "아베다", "아베다_베스트셀러_상품", "상품_" + prdName);
			}
			else if(btnChecker.hasClass('cta_btn')){
				var prdName = $(this).parent().parent().parent().find('.prod_name_link').text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026201", "아베다", "아베다_베스트셀러_상품", "상품_" + prdName);
			}                    
		});
		//상품 - 면세전용
		$(document).on("click", ".aveda .luxury_area .main_menu_list .home_cta2 .hp_inner_item .slick-slide a", function () {
			var btnChecker = $(this);
			if(btnChecker.hasClass('prod_img_link')){
				var prdName = $(this).find("img").attr("alt").replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026201", "아베다", "아베다_면세전용_상품", "상품_" + prdName);
			}
			else if(btnChecker.hasClass('prod_name_link')){
				var prdName = $(this).text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026201", "아베다", "아베다_면세전용_상품", "상품_" + prdName);
			}
			else if(btnChecker.hasClass('cta_btn')){
				var prdName = $(this).parent().parent().parent().find('.prod_name_link').text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026201", "아베다", "아베다_면세전용_상품", "상품_" + prdName);
			}                    
		});
	};


	// 명품관 - 크리니크(025701)
	if ($("body").find(".container.clinique").length) {
		//GNB - depth01
		$(document).on("click", ".clinique .top_fixrow .nav_menu > ul.topnav > li > a", function () {
			if($(this).hasClass('burger_topnav_first')) {
				var menu1stName = $(this).find('span').eq(1).text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_025701", "크리니크", "크리니크_카테고리메뉴", "카테고리메뉴_" + menu1stName);
			}
			else{
				var menu1stName = $(this).find('span').eq(0).text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_025701", "크리니크", "크리니크_카테고리메뉴", "카테고리메뉴_" + menu1stName);
			}
		});
		//GNB - depth02
		$(document).on("click", ".clinique .top_fixrow .nav_menu > ul.topnav > li > ul > li > a", function () {
			var menu1stName = $(this).parent().parent().parent().find('a').eq(0).find('span').eq(1).text().replace(/\s/g, '');
			var menu2ndName = $(this).find('span').text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025701", "크리니크", "크리니크_카테고리메뉴", "카테고리메뉴_" + menu1stName + "_" + menu2ndName);
		});
		//GNB - depth03
		$(document).on("click", ".clinique .top_fixrow .nav_menu > ul.topnav > li > ul > li > ul > li > a", function () {
			var menu1stName = $(this).parent().parent().parent().parent().parent().find('a').eq(0).find('span').eq(1).text().replace(/\s/g, '');
			var menu2ndName = $(this).parent().parent().parent().find('a').eq(0).find('span').eq(1).text().replace(/\s/g, '');
			var menu3rdName = $(this).find('span').text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025701", "크리니크", "크리니크_카테고리메뉴", "카테고리메뉴_" + menu1stName + "_" + menu2ndName + "_" + menu3rdName);
		});
		//배너 - 메인배너
		$(document).on("click", ".clinique .luxury_area .slider_container .slick-slide a", function () {
			var bnrName = $(this).find("img").attr("alt").replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025701", "크리니크", "크리니크_메인배너", "배너_" + bnrName);
		});
		//카테고리 - depth01
		$(document).on("click", ".clinique .luxury_area .home_cta > span", function () {
			var ctg1stName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025701", "크리니크", "크리니크_카테고리", "카테고리_" + ctg1stName);
		});
		//카테고리 - depth02
		$(document).on("click", ".clinique .luxury_area .home_cta .hp_inner_item > ul > li > a", function () {
			var ctg1stName = $(this).parents('.home_cta').find('span').eq(0).text().replace(/\s/g, '');
			var ctg2ndName = $(this).find('.text_title').text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025701", "크리니크", "크리니크_카테고리", "카테고리_" + ctg1stName + "_" + ctg2ndName);
		});
		//카테고리 - depth03
		$(document).on("click", ".clinique .luxury_area .home_cta .hp_inner_item > ul > li > ul > li > a", function () {
			var ctg1stName = $(this).parents('.home_cta').find('span').eq(0).text().replace(/\s/g, '');
			var ctg2ndName = $(this).parents('.nav_tri').find('.text_title').text().replace(/\s/g, '');
			var ctg3rdName = $(this).find('span').text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_025701", "크리니크", "크리니크_카테고리", "카테고리_" + ctg1stName + "_" + ctg2ndName + "_" + ctg3rdName);
		});
		//상품 - 베스트셀러
		$(document).on("click", ".clinique .luxury_area .home_cta1 .hp_inner_item .slick-slide a", function () {
			var btnChecker = $(this);
			if(btnChecker.hasClass('prod_img_link')){
				var prdName = $(this).find("img").attr("alt").replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_025701", "크리니크", "크리니크_베스트셀러_상품", "상품_" + prdName);
			}
			else if(btnChecker.hasClass('prod_name_link')){
				var prdName = $(this).text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_025701", "크리니크", "크리니크_베스트셀러_상품", "상품_" + prdName);
			}
			else if(btnChecker.hasClass('cta_btn')){
				var prdName = $(this).parent().parent().parent().find('.prod_name_link').text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_025701", "크리니크", "크리니크_베스트셀러_상품", "상품_" + prdName);
			}                    
		});
		//상품 - 면세전용
		$(document).on("click", ".clinique .luxury_area .home_cta2 .hp_inner_item .slick-slide a", function () {
			var btnChecker = $(this);
			if(btnChecker.hasClass('prod_img_link')){
				var prdName = $(this).find("img").attr("alt").replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_025701", "크리니크", "크리니크_면세전용_상품", "상품_" + prdName);
			}
			else if(btnChecker.hasClass('prod_name_link')){
				var prdName = $(this).text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_025701", "크리니크", "크리니크_면세전용_상품", "상품_" + prdName);
			}
			else if(btnChecker.hasClass('cta_btn')){
				var prdName = $(this).parent().parent().parent().find('.prod_name_link').text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_025701", "크리니크", "크리니크_면세전용_상품", "상품_" + prdName);
			}                    
		});
	};


	// 명품관 - 랩시리즈(026701)
	if ($("body").find(".container.labseries").length) {
		//GNB - depth01
		$(document).on("click", ".labseries .top_fixrow .nav_menu > ul.topnav > li > a", function () {
			if($(this).hasClass('burger_topnav_first')) {
				var menu1stName = $(this).find('span').eq(1).text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026701", "랩시리즈", "랩시리즈_카테고리메뉴", "카테고리메뉴_" + menu1stName);
			}
			else{
				var menu1stName = $(this).find('span').eq(0).text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026701", "랩시리즈", "랩시리즈_카테고리메뉴", "카테고리메뉴_" + menu1stName);
			}
		});
		//GNB - depth02
		$(document).on("click", ".labseries .top_fixrow .nav_menu > ul.topnav > li > ul > li > a", function () {
			var menu1stName = $(this).parent().parent().parent().find('a').eq(0).find('span').eq(1).text().replace(/\s/g, '');
			var menu2ndName = $(this).find('span').text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_026701", "랩시리즈", "랩시리즈_카테고리메뉴", "카테고리메뉴_" + menu1stName + "_" + menu2ndName);
		});
		//배너 - 메인배너
		$(document).on("click", ".labseries .luxury_area .slider_container .slick-slide a", function () {
			var bnrName = $(this).find("img").attr("alt").replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_026701", "랩시리즈", "랩시리즈_메인배너", "배너_" + bnrName);
		});
		//카테고리 - depth01
		$(document).on("click", ".labseries .luxury_area .main_menu_list .home_cta > span", function () {
			var ctg1stName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_026701", "랩시리즈", "랩시리즈_카테고리", "카테고리_" + ctg1stName);
		});
		$(document).on("click", ".labseries .luxury_area .main_menu_list .home_cta > a", function () {
			var ctg1stName = $(this).text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_026701", "랩시리즈", "랩시리즈_카테고리", "카테고리_" + ctg1stName);
		});
		//카테고리 - depth02
		$(document).on("click", ".labseries .luxury_area .main_menu_list .home_cta .hp_inner_item ul li a", function () {
			var ctg1stName = $(this).parents('.home_cta').find('a').eq(0).text().replace(/\s/g, '');
			var ctg2ndName = $(this).find('.text_title').text().replace(/\s/g, '');
			GA_Event("click_MO_중문_명품관_026701", "랩시리즈", "랩시리즈_카테고리", "카테고리_" + ctg1stName + "_" + ctg2ndName);
		});
		//상품 - 베스트셀러
		$(document).on("click", ".labseries .luxury_area .main_menu_list .home_cta1 .hp_inner_item .slick-slide a", function () {
			var btnChecker = $(this);
			if(btnChecker.hasClass('prod_img_link')){
				var prdName = $(this).find("img").attr("alt").replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026701", "랩시리즈", "랩시리즈_베스트셀러_상품", "상품_" + prdName);
			}
			else if(btnChecker.hasClass('prod_name_link')){
				var prdName = $(this).text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026701", "랩시리즈", "랩시리즈_베스트셀러_상품", "상품_" + prdName);
			}
			else if(btnChecker.hasClass('cta_btn')){
				var prdName = $(this).parent().parent().parent().find('.prod_name_link').text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026701", "랩시리즈", "랩시리즈_베스트셀러_상품", "상품_" + prdName);
			}                    
		});
		//상품 - 면세전용
		$(document).on("click", ".labseries .luxury_area .main_menu_list .home_cta2 .hp_inner_item .slick-slide a", function () {
			var btnChecker = $(this);
			if(btnChecker.hasClass('prod_img_link')){
				var prdName = $(this).find("img").attr("alt").replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026701", "랩시리즈", "랩시리즈_면세전용_상품", "상품_" + prdName);
			}
			else if(btnChecker.hasClass('prod_name_link')){
				var prdName = $(this).text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026701", "랩시리즈", "랩시리즈_면세전용_상품", "상품_" + prdName);
			}
			else if(btnChecker.hasClass('cta_btn')){
				var prdName = $(this).parent().parent().parent().find('.prod_name_link').text().replace(/\s/g, '');
				GA_Event("click_MO_중문_명품관_026701", "랩시리즈", "랩시리즈_면세전용_상품", "상품_" + prdName);
			}                    
		});
	};
	/** E : 2023-07-05 추가 **/

	/* S: 2023-12-25 명품관 슈에무라 추가 */
	$(document).on("click", "#shu-wrap #shu-header .menu-list-shu ul li a", function(){
		var btnTxt = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_명품관_006801", "슈에무라", "슈에무라_카테고리메뉴", "카테고리메뉴_"+btnTxt);
	});
	$(document).on("click", "#shu-wrap #main-shu .slide_box .slick-slide a", function(){
		var btnTxt = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_MO_중문_명품관_006801", "슈에무라", "슈에무라_메인배너", "배너_"+btnTxt);
	});
	$(document).on("click", "#shu-wrap .product_slide .slick-slide a", function(){
		var prodTit = $(this).parents(".main_section").find(".main_tit").text().replace(/\s/g, "");
		var prodTxt = $(this).find(".pro_text_tit").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_명품관_006801", "슈에무라", "슈에무라_"+prodTit, "상품_"+prodTxt);
	});
	$(document).on("click", "#shu-wrap .main_section .product_cate li a", function(){
		var prodTxt = $(this).find("img").attr("alt").replace(/\s/g, "");
		GA_Event("click_MO_중문_명품관_006801", "슈에무라", "슈에무라_제품카테고리", "카테고리_"+prodTxt);
	});
	/* E: 2023-12-25 명품관 슈에무라 추가 */
	/* 명품관 End */
	
	/* 회원가입(온라인/오프라인) Start */
	$(document).on("click", ".join_wrap_new .type_group .join_choose li .join_hpoint", function(){
		GA_Event("click_MO_중문_회원가입_온라인", "온라인", "온라인", "H.point통합회원");
	});
	$(document).on("click", ".join_wrap_new .type_group .join_choose.flex li:nth-of-type(1) a", function(){
		GA_Event("click_MO_중문_회원가입_온라인", "온라인", "온라인", "간편회원가입");
	});
	$(document).on("click", ".join_wrap_new .type_group .join_choose.flex li:nth-of-type(2) a", function(){
		GA_Event("click_MO_중문_회원가입_오프라인", "오프라인", "오프라인", "간편회원가입");
	});
	
	//회원가입 인트로만 ga4Common.js에 넣고 나머지 스탭별로 각 파일에 스크립트 넣음 (GA4로 주석)
	// 회원가입 > STEP01(/mm/mbshJoin/termsAgree.do)
	// 회원가입 > STEP02(/mm/mbshJoin/authentication.jsp)
	// 회원가입 > STEP03(/mm/mbshJoin/localInformation.jsp)
	// 회원가입 > STEP04(/mm/mbshJoin/joinComplete.jsp)
	/* 회원가입(온라인/오프라인) End */
	
	/* 로그인 Start */
	// 로그인 레이어팝업 닫기
	$(document).on("click", "div[aria-describedby='loginLayer'] .ui-dialog-titlebar-close", function(){
		GA_Event("click_MO_중문_로그인", "로그인팝업", "로그인팝업", "닫기");
	});
	
	// 아이디저장 버튼
	$(document).on("click", ".login_box_area .save_check input[name='saveId'] + label", function(){
		if ($(this).prev("input").is(":checked")){
			GA_Event("click_MO_중문_로그인", "로그인팝업", "로그인팝업_탭", "아이디저장안함");
		} else {
			GA_Event("click_MO_중문_로그인", "로그인팝업", "로그인팝업_탭", "아이디저장");
		}
	});
	
	// 로그인 버튼
	$(document).on("click", ".login_box_area form #btnLgin", function(){
		GA_Event("click_MO_중문_로그인", "로그인팝업", "로그인팝업", "로그인");
	});
	
	// 회원가입 버튼
	$(document).on("click", ".login_box_area form .btn_box #aJoin", function(){
		GA_Event("click_MO_중문_로그인", "로그인팝업", "로그인팝업", "회원가입");
	});
	
	// 아이디찾기, 비밀번호찾기
	$(document).on("click", ".login_box_area .idpw_find a", function(){
		if ($(this).attr("id") == "aFindId"){
			GA_Event("click_MO_중문_로그인", "로그인팝업", "로그인팝업", "아이디찿기");
		} else if ($(this).attr("id") == "aFindPwd"){
			GA_Event("click_MO_중문_로그인", "로그인팝업", "로그인팝업", "비밀번호찾기");
		}
	});
	
	// H.point통합회원 로그인
	$(document).on("click", ".login_box_area .hpoint_login a[onclick='hPointLogin()']", function(){
		GA_Event("click_MO_중문_로그인", "로그인팝업_H.Point통합회원", "로그인팝업_H.Point통합회원", "로그인");
	});
	
	// 비회원 버튼
	$(document).on("click", ".login_box_area .nomember_btn ul li a", function(){
		if ($(this).parent().index() == 0){ 
			GA_Event("click_MO_중문_로그인", "로그인팝업", "로그인팝업_비회원", "비회원_비회원주문");
		} else if ($(this).parent().index() == 1){ 
			GA_Event("click_MO_중문_로그인", "로그인팝업", "로그인팝업_비회원", "비회원_비회원주문조회");
		}
	});
	
	//이전 버튼 모음
	$(document).on("click", ".header .history_back", function(){
		if($("form#searchNmbshOrderForm").length > 0){
			GA_Event("click_MO_중문_로그인", "비회원주문조회", "비회원주문조회", "이전");
		}
		if($("form#frmMbshFindIdAuth").length > 0){
			GA_Event("click_MO_중문_로그인", "아이디찾기", "아이디찾기", "이전");
		}
		if($("form#frmMbshFindPwd").length > 0){
			GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_아이디조회", "이전");
		}
		if($("form#frmMbshFindPwdAuth").length > 0){
			GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_본인인증", "이전");
		}
		if($("form#frmMbshFindPwdSmsAuth").length > 0){
			GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_SMS인증", "이전");
		}
		if($("form#frmMbshFindPwdEmailAuth").length > 0){
			GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_이메일인증", "이전");
		}
		if($("form#frmMbshFindPwdChg").length > 0){
			GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_비밀번호변경", "이전");
		}
		if($("form#frmMbshFindPwdCplt").length > 0){
			GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_비밀번호변경완료", "이전");
		}
	});
	
	// 비회원 주문조회
	$(document).on("click", ".nonmember_order .btn_full .btn_basic2.big", function(){
		GA_Event("click_MO_중문_로그인", "비회원주문조회", "비회원주문조회", "주문조회");
	});
	$(document).on("click", ".nonmember_order .txt_with_btn .btn_basic4", function(){
		GA_Event("click_MO_중문_로그인", "비회원주문조회", "비회원주문조회", "회원가입");
	});
	
	// 면세점간편회원 - 아이디찾기
	$(document).on("click", "form[name='frmMbshFindIdAuth'] .tabcon .btn_double .btn_basic1", function(){
		GA_Event("click_MO_중문_로그인", "아이디찾기", "아이디찾기", "취소");
	});
	$(document).on("click", "form[name='frmMbshFindIdAuth'] .tabcon .btn_double .btn_basic2", function(){
		GA_Event("click_MO_중문_로그인", "아이디찾기", "아이디찾기", "확인");
	});

	// 면세점간편회원 - 비밀번호찾기
	$(document).on("click", "form[name='frmMbshFindPwd'] .btn_box .btn_basic1", function(){
		GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_아이디조회", "취소");
	});
	$(document).on("click", "form[name='frmMbshFindPwd'] .btn_box .btn_basic2", function(){
		GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_아이디조회", "확인");
	});
	
	// 면세점간편회원 - 비밀번호찾기 > 본인인증
	$(document).on("click", "form[name='frmMbshFindPwdAuth'] .join_box_type #smsAuca", function(){
		GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_본인인증", "SMS인증");
	});
	$(document).on("click", "form[name='frmMbshFindPwdAuth'] .join_box_type #emailAuca", function(){
		GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_본인인증", "이메일인증");
	});	
	
	// 면세점간편회원 - 비밀번호찾기 > SMS 인증 팝업
	$(document).on("click", "form[name='frmMbshFindPwdSmsAuth'] .btn_box .btn_basic1", function(){
		GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_SMS인증", "취소");
	});
	$(document).on("click", "form[name='frmMbshFindPwdSmsAuth'] #btnConfirm", function(){
		GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_SMS인증", "확인");
	});
	
	// 면세점간편회원 - 비밀번호찾기 > 이메일 인증 팝업
	$(document).on("click", "form[name='frmMbshFindPwdSmsAuth'] .btn_box .btn_basic1", function(){
		GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_이메일인증", "취소");
	});

	// 비밀번호 변경
	$(document).on("click", "form[name='frmMbshFindPwdChg'] #btnChange", function(){
		GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_비밀번호변경", "비밀번호변경");
	});
	
	// 비밀번호 변경완료 버튼
	$(document).on("click", "form[name='frmMbshFindPwdCplt'] .btn_box .btn_basic1", function(){
		GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_비밀번호변경완료", "메인");
	});
	$(document).on("click", "form[name='frmMbshFindPwdCplt'] .btn_box .btn_basic2", function(){
		GA_Event("click_MO_중문_로그인", "비밀번호찾기", "비밀번호찾기_비밀번호변경완료", "로그인");
	});
	/* 로그인 End */
	
	/* 특화관 Start */
	if ($("body").find(".special_visual").length){
		var urlParams = new URLSearchParams(window.location.search),
			spclId = urlParams.get("spclMenuSeq"),
			spclNm = ($(".header .headerTitle").text()).replace($(".header .headerTitle button").text(),"").replace(/\s/g, "");
		
		// 매인배너
		$(document).on("click", ".special_visual .visual_item", function(){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_특화관_"+spclId, spclNm, spclNm+"_메인배너", "메인배너_"+bnnrNm);
		});
		
		// 영상영역
		$(document).on("click", ".video_area", function(){
			var bnnrNm = $(this).parents(".spe_edit").find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_특화관_"+spclId, spclNm, spclNm+"_메인배너영상", "메인배너영상_"+spclNm);
		});
		
		// 해시태그
		$(document).on("click", ".hash_tag_wrap a", function(){
			var tagTerm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_특화관_"+spclId, spclNm, spclNm+"_해시태그", "해시태그_"+tagTerm);
		});		
		
		// 쿠폰
		$(document).on("click", ".coupon_list_wrap .coupon_list li a", function(){
			var coupTxt = $(this).find(".coupon_tit").text(),
				coupTxt1 = $(this).find(".coupon_price").text(),
				coupNm = (coupTxt+"_"+coupTxt1).replace(/\s/g, ""),
				coupNmCut = coupNm.substring(0, 20);
			if (coupNm.length > 20){ // 글자수 제한(20자 이상 삭제)
				GA_Event("click_MO_중문_특화관_"+spclId, spclNm, spclNm+"_쿠폰", "쿠폰_"+coupNmCut+"⋯");
			} else {
				GA_Event("click_MO_중문_특화관_"+spclId, spclNm, spclNm+"_쿠폰", "쿠폰_"+coupNm);
			}
		});
		
		// 추천브랜드
		$(document).on("click", ".spclBranArea li a", function(){
			var branNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_특화관_"+spclId, spclNm, spclNm+"_추천브랜드", "브랜드_"+branNm);
		});
		
		// 추천상품
		$(document).on("click", ".recommendGoosList ul li", function(){
			var prodNm = $(this).find("brand_ex.goosNm").text();
			GA_Event("click_MO_중문_특화관_"+spclId, spclNm, spclNm+"_추천상품", "상품_"+prodNm);
		});
		
		// 세트상품
		$(document).on("click", ".spclSetEvtArea ul li .btn_set button", function(){
			var prodNm = $(this).parents("li").find(".prd_img img").attr("alt");
			GA_Event("click_MO_중문_특화관_"+spclId, spclNm, spclNm+"_세트상품", "상품_"+prodNm);
		});
		
		// 상품리스트
		$(document).on("click", ".goosMoreArea ul li", function(){
			var prodNm = $(this).find("brand_ex.goosNm").text();
			GA_Event("click_MO_중문_특화관_"+spclId, spclNm, spclNm+"_상품리스트", "상품_"+prodNm);
		});
	}
	/* 특화관 End */


	/* 템플릿관 Start */
	if ($("body").find(".container.shop").length){
		var urlParams = new URLSearchParams(window.location.search),
			branCd = urlParams.get("onlnBranCd"),
			branNm = $(".sub_title h2 img").attr("alt").replace(/\s/g, "");

		/* 템플릿관 > 기본형 */
		// 상단버튼
		$(document).on("click", ".basic .sub_title .bull_like_area .bull_like", function(){
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_기본형", branNm+"_기본형_상단", "좋아요");
		});
		$(document).on("click", ".basic .sub_title .bull_like_area .bull_alim", function(){
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_기본형", branNm+"_기본형_상단", "알림설정");
		});
		
		// 메인배너
		$(document).on("click", ".basic .top_banner .banner_item a", function(){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_기본형", branNm+"_기본형_메인배너", "배너_"+bnnrNm);
		});
		
		// 중간배너
		$(document).on("click", ".basic .r_banner_con .prd_item a", function(){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_기본형", branNm+"_기본형_중간배너", "배너_"+bnnrNm);
		});
		
		// 분할배너
		$(document).on("click", ".basic .b_banner_con ul li a", function(){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_기본형", branNm+"_기본형_분할배너_하단", "배너_"+bnnrNm);
		});
		
		// 베스트상품
		$(document).on("click", ".basic .mkk_row_list .swiper_group ul li", function(){
			var prodNm = $(this).find("img").attr("alt");
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_기본형", branNm+"_기본형_베스트상품", "상품_"+prodNm);
		});
		
		// 신상품
		$(document).on("click", ".basic .mkk_row_list2 .swiper_group ul li", function(){
			var prodNm = $(this).find("img").attr("alt");
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_기본형", branNm+"_기본형_신상품", "상품_"+prodNm);
		});

		/* 템플릿관 > 확장형 */
		// 상단버튼
		$(document).on("click", ".expand .sub_title .bull_like_area .bull_like", function(){
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_상단", "좋아요");
		});
		$(document).on("click", ".expand .sub_title .bull_like_area .bull_alim", function(){
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_상단", "알림설정");
		});
		
		// 상세탭
		$(document).on("click", ".expand .shop_menu .depth1_wrap .depth1_con a", function(){
			var tabNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_상단_상세탭", "상세탭_"+tabNm);
		});

		// 메인배너
		$(document).on("click", ".expand .top_banner .banner_list .banner_item a", function(){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_메인배너", "배너_"+bnnrNm);
		});
		
		// 분할배너 상단
		$(document).on("click", ".expand .r_banner_con .banner_list .prd_item a", function(){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_분할배너_상단", "배너_"+bnnrNm);
		});
		
		// 분할배너 하단
		$(document).on("click", ".expand .b_banner_con ul li a", function(){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_분할배너_하단", "배너_"+bnnrNm);
		});
		
		// 베스트상품
		$(document).on("click", ".expand .mkk_row_list .swiper_group ul li", function(){
			var prodNm = $(this).find("img").attr("alt");
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_베스트상품", "상품_"+prodNm);
		});
		
		// 신상품
		$(document).on("click", ".basic .mkk_row_list2 .swiper_group ul li", function(){
			var prodNm = $(this).find("img").attr("alt");
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_기본형", branNm+"_기본형_신상품", "상품_"+prodNm);
		});
		
		// 이미지영역
		$(document).on("click", ".expand .banner_wide_con .banner_list .banner_item a", function(){
			var bnnrNm = $(this).find("img").attr("alt").replace(/\s/g, "");
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_이미지영역", "배너_"+bnnrNm);
		});
		
		// 상품영역
		$(document).on("click", ".expand .mkk_row_list2 .swiper_group ul li", function(){
			var prodNm = $(this).find("img").attr("alt");
			GA_Event("click_MO_중문_템플릿관_"+branCd, branNm+"_확장형", branNm+"_확장형_할인상품", "상품_"+prodNm);
		});
	}
	/* 템플릿관 End */

	/* S: 3차 개선건 GA4 20231212 */
	/* 세일 Start */
	// 세일 오늘의 특가
	$(document).on("click", ".container .area-display-sale .panel.specials .pn-tit a.move-to-morepage", function () {
		GA_Event("click_MO_중문_세일", "세일", "세일_오늘의특가", "더보기");
	});
	$(document).on("click", ".container .area-display-sale .panel.specials .specials_tab > ul li.display_tab_item button", function(){
		var tabNm = $(this).parents("li.is-active").find("button span").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_세일", "세일", "세일_오늘의특가", "탭_"+tabNm);
	});
	$(document).on("click", ".container .area-display-sale .panel.specials .specials_tab .specials_products .specials_products_swiper_mo li .product__item a", function(){
		var branNm = $(this).find(".product__brand").text().replace(/\s/g, ""),
			goosNm = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_세일", "세일", "세일_오늘의특가_탭_특가상품", "상품_"+branNm+"_"+goosNm);
	});
	$(document).on("click", ".container .area-display-sale .panel.specials .specials_tab .specials_brands .specials_brands_swiper_mo li .product__item a", function(){
		var branNm = $(this).find(".product__img--logo img").attr("alt").replace(/\s/g, "");
		GA_Event("click_MO_중문_세일", "세일", "세일_오늘의특가_탭_특가브랜드", "브랜드_"+branNm);
	});

	// 세일 공구특가 뭉치면 싸진다!
	$(document).on("click", ".container .area-display-sale .panel.hshares .specials_h-share_swiper_mo .product__item a", function () {
		var branNm = $(this).find(".product__brand").text().replace(/\s/g, ""),
			prdName = $(this).find(".product__brand-info").text().replace(/\s/g, '');
		GA_Event("click_MO_중문_세일", "세일", "세일_공구특가뭉치면싸진다!", "상품_" + branNm + "_" + prdName);
	});
	$(document).on("click", ".container .area-display-sale .panel.hshares .specials_h-share_swiper_mo .product-more-link a", function () {
		var bnnrNm = $(this).find("p").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_세일", "세일", "세일_공구특가뭉치면싸진다!", "배너_" + bnnrNm);
	});
	
	//세일 세일상품 둘러보기
	$(document).on("click", ".container .area-display-sale .panel.browse .browse_category.search-round-data-wrap .search-round-data li button", function () {
		var tabNm = $(this).find("span").text().replace(/\s/g, '');
		GA_Event("click_MO_중문_세일", "세일", "세일_세일상품둘러보기", "할인율_" + tabNm);
	});
	$(document).on("click", ".container .area-display-sale .panel.browse .product-saerch-list-top .product-saerch-list-middle .toggle-switch-wrap label input[id='filterSoldOutYn']", function () {
		if ($(this).is(":checked") == true){
			GA_Event("click_MO_중문_세일", "세일", "세일_세일상품둘러보기", "품절_토글on");
		} else {
			GA_Event("click_MO_중문_세일", "세일", "세일_세일상품둘러보기", "품절_토글off");
		}
	});
	if ($(".container").find(".area-display-sale").length) {
		$(document).on("click", ".wrap-list-dropdown .list-dropdown[data-parentid='goodsListOrder'] li button", function(){
			var optNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_세일", "세일", "세일_세일상품둘러보기", "정렬기준_"+optNm);
		});
	}
	$(document).on("click", ".container .area-display-sale .panel.browse .browse_itemlist #goosArea .goosMoreArea .list-product.list-product__searchlist .goosList.item a", function () {
		var branNm = $(this).parents(".goosList.item").find(".brand").text().replace(/\s/g, ''),
			prdName = $(this).parents(".goosList.item").find(".brand_ex").text().replace(/\s/g, '');
		GA_Event("click_MO_중문_세일", "세일", "세일_세일상품둘러보기", "상품_" + branNm + "_" + prdName);
	});
	$(document).on("click", ".container .area-display-sale .panel.browse .browse_itemlist #goosArea .goosMoreArea .list-product.list-product__searchlist .goosList.item .cart a", function () {
		GA_Event("click_MO_중문_세일", "세일", "세일_세일상품둘러보기", "장바구니담기");
	});
	
	//2024-08-12 첫구매딜 추가특가
	$(document).on("click", ".container .area-display-sale .panel.firstdeal .pn-tit a.move-to-morepage", function () {
		GA_Event("click_MO_중문_세일", "세일", "세일_첫구매딜", "더보기");
	});
	$(document).on("click", ".container .area-display-sale .panel.firstdeal .pn-cont .sale__first-deal .product__item a", function(){
		var prdName = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_세일", "세일", "세일_첫구매딜", "상품_"+prdName);
	});
	/* 세일 End */

	/* S: 베스트 */
	$(document).on("click", ".container .area-display-bests .panel.bests .bests_tab ul li.display_tab_item button", function(){
		var tabNm = $(this).parents("li.is-active").find("button span").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_베스트", "베스트", "베스트_탭", "탭_"+tabNm);
	});
	$(document).on("click", ".container .area-display-bests .panel.bests .bests_tab .bests_goods .search-round-data-wrap.bests_ico ul li button", function(){
		var cateNm = $(this).parents("li.is-active").find("button span").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_베스트", "베스트", "베스트_탭_베스트상품", "카테고리_"+cateNm);
	});
	$(document).on("click", ".container .area-display-bests .panel.bests .bests_tab .bests_goods .bests_itemlist .list-product li a", function(){
		var branNm = $(this).parents("li").find(".brand").text().replace(/\s/g, ""),
			goosNm = $(this).parents("li").find(".brand_ex").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_베스트", "베스트", "베스트_탭_베스트상품", "상품_"+branNm+"_"+goosNm);
	});
	$(document).on("click", ".container .area-display-bests .panel.bests .bests_tab .bests_goods .bests_itemlist .list-product li .cart a", function(){
		GA_Event("click_MO_중문_베스트", "베스트", "베스트_탭_베스트상품", "장바구니담기");
	});
	$(document).on("click", ".container .area-display-bests .panel.bests .bests_tab .bests_brand .bests_brand_item .bests_brand_thumb a", function(){
		var branNm = $(this).find(".bests_brand_tit").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_베스트", "베스트", "베스트_탭_베스트브랜드", "브랜드_"+branNm);
	});
	$(document).on("click", ".container .area-display-bests .panel.bests .bests_tab .bests_brand .bests_brand_item .bests_brand_item--btmbox .product__item a", function(){
		var goosNm = $(this).find("img").attr("alt").replace(/\s/g, '');
		GA_Event("click_MO_중문_베스트", "베스트", "베스트_탭_베스트브랜드", "상품_"+goosNm);
	});
	/* S : 2025-05-30 국중영 PC/MO 베스트 > 재입고 알림 / 큐레이션 관련 GA4 추가 */
	$(document).on("click", ".container .area-display-bests .panel.bests .bests_tab .bests_goods .bests_itemlist .list-product li .no_stoc", function(){		
		GA_Event("click_MO_중문_베스트", "베스트", "베스트_탭_재입고알림", "더보기");		
	});
	/* E : 2025-05-30 국중영 PC/MO 베스트 > 재입고 알림 / 큐레이션 관련 GA4 추가 */
	/* E: 베스트 */

	/* 혜택 Start */
	$(document).on("click", ".container .area-display-benefits .benefits-topbanner-swiper_mo .banner_item a", function(){
		var bnnrNm = $(this).find(".banner_tit p").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_혜택", "혜택", "혜택_배너", "배너_"+bnnrNm);
	});
	$(document).on("click", ".container .area-display-benefits .panel.benefits .benefits_tab > ul li.display_tab_item button", function(){
		var tabNm = $(this).parents("li.is-active").find("button span").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_혜택", "혜택", "혜택_탭", "탭_"+tabNm);
	});
	$(document).on("click", ".container .area-display-benefits .panel.benefits .benefits_tab .display_search .display_search_top button[onclick='searchEvntSpex();']", function(){
		var tabNm = $(this).parents(".panel.benefits").find(".benefits_tab > ul").find("li.is-active button span").text().replace(/\s/g, ""),
			srchTxt = $(this).parents(".display_search_top").find("input[id='searchTerm']").val().replace(/\s/g, "");
		GA_Event("click_MO_중문_혜택", "혜택", "혜택_탭_"+tabNm+"_검색", "검색어_"+srchTxt);
	});
	$(document).on("click", ".container .area-display-benefits .panel.benefits .benefits_tab .display_tab_content.benefits_online .display_tab_menu li button", function(){
		var tabNm = $(this).parents(".panel.benefits").find(".benefits_tab > ul").find("li.is-active button span").text().replace(/\s/g, ""),
			tabContNm = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_혜택", "혜택", "혜택_탭_"+tabNm+"_컨텐츠탭", "컨텐츠탭_"+tabContNm);
	});
	$(document).on("click", ".container .area-display-benefits .panel.benefits .benefits_tab .display_tab_content.benefits_online .search-round-data[id='trdCtgAra'] ul li button", function(){
		var tabContNm = $(this).find("span").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_혜택", "혜택", "혜택_탭_오프라인혜택_컨텐츠탭_지점", "오프라인지점_"+tabContNm);
	});
	$(document).on("click", ".container .area-display-benefits .panel.benefits .benefits_tab .display_tab_content.benefits_online #ulEvntList li a", function(){
		var tabNm = $(this).parents(".panel.benefits").find(".benefits_tab > ul").find("li.is-active button span").text().replace(/\s/g, ""),
			bnnrNm = $(this).find(".tit").text().replace(/\s/g, ""),
			bnnrNm2 = $(this).find(".txt_sub").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_혜택", "혜택", "혜택_탭_"+tabNm+"_기획전", "기획전_"+bnnrNm+bnnrNm2);
	});
	$(document).on("click", ".container .area-display-benefits .panel.benefits .benefits_tab .display_tab_content.benefits_online #ulEvntList li button.btn_like", function(){
		var tabNm = $(this).parents(".panel.benefits").find(".benefits_tab > ul").find("li.is-active button span").text().replace(/\s/g, "");
		GA_Event("click_MO_중문_혜택", "혜택", "혜택_탭_"+tabNm+"_기획전", "좋아요");
	});
	/* 혜택 End */

	/* 검색결과 Start */
	$(document).on("click", ".productSaerchList .search-round-data button", function () {
		var srchRelated = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_검색결과", "검색결과", "검색결과_연관검색어", "연관검색어_"+srchRelated);
	});
	$(document).on("click", ".productSaerchList .list-product__recommend .product__item a", function () {
		var txtProd = $(this).find(".product__brand-info").text().replace(/\s/g, "");
		if($(".productSaerchList #noResultSet").is(":visible")){
			GA_Event("click_MO_중문_검색결과", "검색결과없음", "상품추천", "상품_"+txtProd);
		} else {
			GA_Event("click_MO_중문_검색결과", "검색결과", "상품추천", "상품_"+txtProd);
		}
	});
	$(document).on("click", ".productSaerchList .list-product__recommend .product__item a .btn-cart", function () {
		var txtProd = $(this).parents(".product__item").find(".product__brand-info").text().replace(/\s/g, "");
		if($(".productSaerchList #noResultSet").is(":visible")){
			GA_Event("click_MO_중문_검색결과", "검색결과없음", "상품추천", "장바구니담기_"+txtProd);
		} else {
			GA_Event("click_MO_중문_검색결과", "검색결과", "상품추천", "장바구니담기_"+txtProd);
		}
	});
	/* 검색결과 End */
	/* E: 3차 개선건 GA4 20231212 */

	/* S : 2026-04-10 국중영 MO 관심상품 추가 */
	$(document).on("click", ".wishlist .category-menu-one-depth ul li a", function () {
		var tabNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심", "관심_탭", tabNm);
	});

	$(document).on("click", ".wishlist .category-menu-two-depth ul li a", function () {
		var tabNm = $(this).parents('.product-list').find('.category-menu-two-depth-wrap li a.active').text().replace(/\s/g, "");
		var cateNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심", "관심_"+tabNm, cateNm);
	});

	$(document).on("click", ".wishlist .saerch-result-content .toggle-switch", function () {
		GA_Event("click_MO_중문_관심", "관심", "관심", "품절제외");
	});

	if ($(".container").find(".productList.wishlist").length) {
		$(document).on("click", ".wrap-list-dropdown .list-dropdown[data-parentid='goodsListOrder'] li button", function(){
			var sortNm = $(this).text().replace(/\s/g, "");
			GA_Event("click_MO_중문_관심", "관심", "관심_정렬기준", "정렬기준_"+sortNm);
		});
	}

	$(document).on("click", ".wishlist .product-list .saerch-result-content .wishlist-yes-content-wrap .renew_product_area_type-2line li a", function () {
		var goosNm = $(this).parents("li").attr("data-goosnm").replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심_관심상품", goosNm, "더보기");
	});

	$(document).on("click", ".wishlist .product-list .saerch-result-content .wishlist-yes-content-wrap .renew_product_area_type-2line li .main-btn--like", function () {
		var goosNm = $(this).parents("li").attr("data-goosnm").replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심_관심상품", goosNm, "찜하기");
	});

	$(document).on("click", ".wishlist .product-list .saerch-result-content .wishlist-yes-content-wrap .renew_product_area_type-2line li .renew_btn__restock", function () {
		var goosNm = $(this).parents("li").attr("data-goosnm").replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심_관심상품", goosNm, "재입고알림");
	});

	$(document).on("click", ".wishlist .wishlist-yes-content-wrap .best-brands-wrap .title-box .txt-box a", function () {
		var brdNm = $(this).find('span').text().replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심_관심브랜드", brdNm, "더보기");
	});

	$(document).on("click", ".wishlist .wishlist-yes-content-wrap .best-brands-wrap .title-box button.like-btn", function () {
		var brdNm = $(this).parents('.title-box').find('.title').find('span').text().replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심_관심브랜드", brdNm, "찜하기");
	});

	$(document).on("click", ".wishlist .wishlist-yes-content-wrap .best-brands-wrap .swiper__wishlist-best-brands li a", function () {
		var brdNm = $(this).find('.renew_product__brand').text().replace(/\s/g, "");
		var goosNm = $(this).parents("li").attr("data-goosnm").replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심_관심브랜드", brdNm, goosNm);
	});

	$(document).on("click", ".wishlist .wishlist-yes-content-wrap .best-brands-wrap .swiper__wishlist-best-brands li .main-btn--like", function () {
		var brdNm = $(this).parents('li').find('.renew_product__brand').text().replace(/\s/g, "");
		var goosNm = $(this).parents("li").attr("data-goosnm").replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심_관심브랜드", brdNm+"_"+goosNm, "찜하기");
	});

	$(document).on("click", ".wishlist .wishlist-yes-content-wrap .best-brands-wrap .swiper__wishlist-best-brands li .renew_product__cart button", function () {
		var brdNm = $(this).parents('li').find('.renew_product__brand').text().replace(/\s/g, "");
		var goosNm = $(this).parents("li").attr("data-goosnm").replace(/\s/g, "");
		var btnNm = $(this).text().replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심_관심브랜드", brdNm+"_"+goosNm, btnNm);
	});

	$(document).on("click", ".wishlist .wishlist-yes-content-wrap .recent-item-wrap .sub-title button.btn-recent-clear", function () {
		GA_Event("click_MO_중문_관심", "관심_최근 본", "최근 본 상품", "전체삭제");
	});

	$(document).on("click", ".wishlist .wishlist-yes-content-wrap .recent-item-wrap ul li .recent-prd .prd_img", function () {
		var goosNm = $(this).parents(".item-box").attr("data-goosnm").replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심_최근 본", goosNm, "더보기");
	});

	$(document).on("click", ".wishlist .wishlist-yes-content-wrap .recent-item-wrap ul li .recent-prd .txt-box", function () {
		var goosNm = $(this).parents(".item-box").attr("data-goosnm").replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심_최근 본", goosNm, "더보기");
	});


	if ($(".container").find(".productList.wishlist").length) {
		$(document).on("click", ".prd_del", function () {
			var goosNm = $(this).closest(".item-box").attr("data-goosnm").replace(/\s/g, "");
			GA_Event("click_MO_중문_관심", "관심", "관심_최근 본_"+goosNm, "상품삭제");
		});
	}

	$(document).on("click", ".wishlist .wishlist-yes-content-wrap .recent-item-wrap ul li .recent-prd .like_btn", function () {
		var goosNm = $(this).closest(".item-box").attr("data-goosnm").replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심", "관심_최근 본_"+goosNm, "찜하기");
	});

	$(document).on("click", ".wishlist .wishlist-yes-content-wrap .recent-item-wrap ul li .recent-prd .best_cart_btn", function () {
		var goosNm = $(this).closest(".item-box").attr("data-goosnm").replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심", "관심_최근 본_"+goosNm, "담기");
	});

	$(document).on("click", ".wishlist .wishlist-yes-content-wrap .recent-item-wrap ul li .recent-prd .renew_btn_best__restock", function () {
		var goosNm = $(this).closest(".item-box").attr("data-goosnm").replace(/\s/g, "");
		GA_Event("click_MO_중문_관심", "관심", "관심_최근 본_"+goosNm, "재입고알림");
	});
	/* E : 2026-04-10 국중영 MO 관심상품 추가 */
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