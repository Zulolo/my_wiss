var MODULE_NORMAL_WORKING_MODE_NUM = "0";
var MODULE_INITIAL_WORKING_MODE_NUM = "1";
var WLAN_INFRASTRUCTURE_OPERATION_MODE_NUM = "0";
var WLAN_AP_OPERATION_MODE_NUM = "2";
var Advantech =  Advantech || {};
$.extend(true, Advantech, {
    ConstantParamter: {
        SlotNumber: 1
    },
	Profile:{
			Information:{
				Version:"A1.00 B00",
				Vender:"Advantech Corp.",
				Contact:"www.advantech.com",
				Product:"WISE Web Configuration Utility",
				Date:"2015",
			},
    		AdvancedEmun:{
    			ADAMT1X0Series:{
    				getAdvancedFunctionProfile:function(){
					    var advancedFunctions = [];
					    advancedFunctions.push(new Advantech.Data.AdvancedFunctionPageInfo("accessCtrl", "access_ctrl.html", "Access Control"));
					    advancedFunctions.push(new Advantech.Data.AdvancedFunctionPageInfo("dataLog", "data_log.html", "Data Logger"));
					    advancedFunctions.push(new Advantech.Data.AdvancedFunctionPageInfo("diagnostic", "diagnostic.html", "Diagnostician"));	  
					    //advancedFunctions.push(new AdvancedFunctionPageInfo("gcl", "#", "GCL"));	  
					    return advancedFunctions;
					},
    			},
    		},
         ModuleWorkingModeEmun: {
            "0": "Normal Mode",
            "1": "Initial Mode"
        },
        WlanOperationModeEmun: {
            "0": "Infrastructure Mode",
            "1": "Reserved",
            "2": "AP Mode",
        },
        API_ERROR_CODE_NAME :{
            "404":  "File not found",
            "405":  "The request method (POST or GET) is not allowed on the requested resource.",
            "411":  "The required Content-length header is missing.",
            "1000": "User name or password related error",
            "1101": "User permission related error",
            "1102": "The server refuses to ful-fill the request due to authentication error, such as invalid cookie.",
            "1150": "The login list is full.",
            "2000": "Invalid Data (Invalid object value)",
            "2101": "The AI range codes are not consistent for average CH",
            "2150": "AI zero calibration processed unsuccessfully.",
            "2151": "AI span calibration processed unsuccessfully.",
            "2152": "Unable to reset the AI calibration data",
            "2200": "IP and Gateway are not in the same IP range according to subnet calculation.",
            "2201": "IP Access Control List Validation Error",
            "2300": "Invalid file size",
            "2301": "Illegal file",
            "2350": "Internal memory error(fail to erase/write)",
            "2351": "Fail to upgrade Boot loader image",
            "2352": "Fail to upgrade firmware application image",
            "3051": "Fail to get log data because the other request is still processing",
            "4000": "Cloud setting error",
            "4100": "Connection error between device and cloud server"
        }
  	},
	Form:{
		ConfigForm:{
            WLanStatusPanel:function(panelId){
                var RSSI_STATUS_EMUN = ["Very Poor", "Poor", "Fair", "Good", "Very Good"];
                var RSSI_STATUS_CLASS_EMUN = ["iconic-signal-none", "iconic-signal-weak", "iconic-signal-medium", "iconic-signal-strong", "iconic-signal-strong"];
                var _onWLanStatusRefreshed = null;
                var mContextPanelId = panelId;
                var _Self = this;
                var _$SignalControl;
                var _$Panel;
                this.getPanelId = function() {
                    return mContextPanelId;
                };
                this.onWLanStatusRefreshed = function(x) {
                    if (!arguments.length) return this._onWLanStatusRefreshed;
                    this._onWLanStatusRefreshed = x;
                };
                this.initialPanel = function(){
                     _$Panel = $("#"+_Self.getPanelId());
                     _$SignalControl  = _$Panel.find("#divRssi");
                     handleRefreshed();
                };
                var setSignalValue = function(val){
                    $('.signal-change').each(function(){
                        var classArray = $(this).attr('class').split(" ");
                        classArray[classArray.length-1] = RSSI_STATUS_CLASS_EMUN[val];
                        $(this).attr('class', classArray.join(" "));

                    });
                    _$SignalControl.find("#rssiDescr").html(RSSI_STATUS_EMUN[val]);   
                };
                this.setPanel = function(jsonObj){
                    if(jsonObj.IWId != ""){
                        _$Panel.find("#divIWId").html(jsonObj.IWId);
                        _$Panel.find(".IWIdType").show();
                    }
                    else{
                        _$Panel.find(".IWIdType").hide();
                    }
                    if(jsonObj.AMac != ""){
                        _$Panel.find("#divAMac").html(jsonObj.AMac);
                        _$Panel.find(".AMacType").show();
                    }
                    else{
                        _$Panel.find(".AMacType").hide();
                    }
                    var moduleMode = Advantech.Data.ModuleData.getInstance().getMode();
                    var wLanMode = Advantech.Data.NetworkData.WlanData.getInstance().getMode();
                    if((moduleMode !=undefined && moduleMode==MODULE_INITIAL_WORKING_MODE_NUM ) || 
                        (wLanMode !=undefined && wLanMode == WLAN_AP_OPERATION_MODE_NUM)){
                        _$Panel.find(".RssiLevel").hide(); //hide RSSI in AP mode
                        _$Panel.find("#btnWLanRefresh").hide();
                    }
                    else{
                        setSignalValue(jsonObj.Rssi);
                    }
                };
                var handleRefreshed = function(){
                    var $btn = $("#"+_Self.getPanelId()+" #btnWLanRefresh");
                    $btn.click(function(){
                        if($.isFunction(_Self.onWLanStatusRefreshed())){
                            _Self.onWLanStatusRefreshed().apply(this,[{}]);
                        }
                    });
                };
            },
            WLanConfigPanel:function(panelId){
                var _onWLanConfigSubmitted = null;
                var mContextPanelId = panelId;
                var _Self = this;
                var _$Panel;
                this.getPanelId = function() {
                    return mContextPanelId;
                };
                this.onWLanConfigSubmitted = function(x) {
                    if (!arguments.length) return this._onWLanConfigSubmitted;
                    this._onWLanConfigSubmitted = x;
                };
                this.initialPanel = function(){
                     _$Panel = $("#"+_Self.getPanelId());
                    handleMdSelect();
                    handleAPSecTpyeSelect();
                    handleISecTpyeSelect();
                    handleCountryCodeSelect();
                    handleSubmitted();
                };
                this.setPanel = function(jsonObj){
                    _$Panel.find("#selMd").val(jsonObj.Md).trigger('change');
                    _$Panel.find("#inpISSID").val(jsonObj.ISSID);
                    _$Panel.find("#selISec").val(jsonObj.ISec).trigger('change');
                    _$Panel.find("#inpIKey").val(jsonObj.IKey);
                    _$Panel.find("#inpASSID").val(jsonObj.ASSID);
                    _$Panel.find("#inpAHid").prop('checked', Boolean(Number(jsonObj.AHid)));
                    _$Panel.find("#selACnty").val(jsonObj.ACnty).trigger('change');
                    _$Panel.find("#inpACh").val(jsonObj.ACh);
                    _$Panel.find("#selASec").val(jsonObj.ASec).trigger('change');
                    _$Panel.find("#inpAKey").val(jsonObj.AKey);
                    //ifra-struct mode ip
                    _$Panel.find("#inpIP").val(jsonObj.IP);
                    _$Panel.find("#inpMsk").val(jsonObj.Msk);
                    _$Panel.find("#inpGW").val(jsonObj.GW);
                    //AP mode ip
                    _$Panel.find("#inpAIP").val(jsonObj.AIP);
                    _$Panel.find("#inpAMsk").val(jsonObj.AMsk);
                    _$Panel.find("#inpAGW").val(jsonObj.AGW);

                    _$Panel.find("#inpMAC").val(jsonObj.MAC);
                    if(jsonObj.DHCP == 1){
                        _$Panel.find("#inpIpDHCP").prop('checked', true).trigger('click');
                        _$Panel.find("#RadioIpDHCP").prop('checked', true).trigger('click');
                    }else{
                        _$Panel.find("#inpIpStatic").prop('checked', true).trigger('click');
                        _$Panel.find("#RadioIpStatic").prop('checked', true).trigger('click');
                    }                    
                };
                var handleSubmitted = function(){
                    var $btn = $("#"+_Self.getPanelId()+" #btnWLanConfig");
                    $btn.click(function(){
                        if($.isFunction(_Self.onWLanConfigSubmitted())){
                            _Self.onWLanConfigSubmitted().apply(this,[this, _Self.toJson()]);
                        }
                    });
                };
                var handleMdSelect = function(){
                    var $selMd = $("#"+_Self.getPanelId()+" #selMd");
                    $selMd.change(function(){
                        var val = $(this).val();
                        var $currentOption = $(this).find("option[value='"+val+"']");
                        $(this).find("option").each(function(){
                            var target = $(this).attr('data-target');
                            if(target != undefined){
                                var elements = target.split(" ");
                                for(ele in elements){
                                   $(elements[ele]).hide(); 
                                }
                            }
                        });
                        var target = $currentOption.attr('data-target');
                        if(target != undefined){
                            var elements = target.split(" ");
                            for(ele in elements){
                                $(elements[ele]).show();
                            }
                        }
                    });
                }
                var handleAPSecTpyeSelect = function(){
                    var $selASec = $("#"+_Self.getPanelId() +" #selASec");
                    $selASec.change(function(){
                        var val = $(this).val();
                        var $currentOption = $(this).find("option[value='"+val+"']");
                        if(Boolean(Number($currentOption.attr('data-isShow')))){
                            _$Panel.find($currentOption.attr('data-target')).show();
                        }
                        else{
                            _$Panel.find($currentOption.attr('data-target')).hide();
                        }
                        
                    });
                };
                var handleISecTpyeSelect = function(){
                    var $selISec = $("#"+_Self.getPanelId() +" #selISec");
                    $selISec.change(function(){
                        var val = $(this).val();
                        var $currentOption = $(this).find("option[value='"+val+"']");
                        if(Boolean(Number($currentOption.attr('data-isShow')))){
                            _$Panel.find($currentOption.attr('data-target')).show();
                        }
                        else{
                            _$Panel.find($currentOption.attr('data-target')).hide();
                        }
                    });
                };
                var handleCountryCodeSelect = function(){
                    var $selACnty = $("#"+_Self.getPanelId() +" #selACnty");
                    $selACnty.change(function(){
                        var val = $(this).val();
                        var $currentOption = $(this).find("option[value='"+val+"']");
                        _$Panel.find($currentOption.attr('data-target')).attr("max", $currentOption.attr('data-max'));
                        if(Number(_$Panel.find($currentOption.attr('data-target')).val()) > Number($currentOption.attr('data-max'))){
                            _$Panel.find($currentOption.attr('data-target')).val($currentOption.attr('data-max'));
                        }
                    });
                };
                this.toJson = function(isShowHidden){
                    var obj = {}, isAddHidden = (isShowHidden)?true:false;
                    $("#" + _Self.getPanelId() + " input").each(function() {
                        if (!$(this).is(":disabled") && ($(this).css("display")!='none') && $(this).is(":visible") || isAddHidden) {
                            var type = this.type;
                            var id = this.id.slice(3);
                            if (type === "checkbox") {
                                obj[id] = (this.checked) ? 1 : 0;
                            } else if (type === "radio") {
                                if(this.checked) //skip other unchecked radio
                                    obj['DHCP'] = Number($(this).val());
                            } else if (type === "number" || $(this).hasClass("isNumericType")) {
                                obj[id] = Number($(this).val());

                            } else {
                                obj[id] = $(this).val();
                            }
                        }
                    });
                    $("#" + _Self.getPanelId() + " select").each(function() {
                        if (!$(this).is(":disabled") && ($(this).css("display")!='none') && $(this).is(":visible") || isAddHidden) {
                            var id = this.id.slice(3);
                            obj[id] = Number($(this).val());
                        }
                    });
                    return obj;
                };
            },
			NetworkPanel: function(panelId, isViewOnly) {
                var _onNetworkConfigSubmitted = null;
                var mContextPanelId = panelId;
                var mIsViewOnly = isViewOnly;
                var _Self = this;

                this.getPanelId = function() {
                    return mContextPanelId;
                };

                this.isViewOnly = function() {
                    return mIsViewOnly;
                };

                this.toNetConfigJson = function() {
                    //var md = parseInt($('#' + _Self.getPanelId() + ' input[name=IpType]:checked').val(), 10);
					var md = parseInt($('#' + _Self.getPanelId() + ' input[type=radio]:checked').val(), 10);
                    var jsonObj = {};
                    jsonObj.DHCP = md;
                    if (md === 0) {
                        jsonObj.IP = $("#" + _Self.getPanelId() + " #inpIP").val();
                        jsonObj.Msk = $("#" + _Self.getPanelId() + " #inpMsk").val();
                        jsonObj.GW = $("#" + _Self.getPanelId() + " #inpGW").val();
                    } 
                    else if (md === 1) {

                    } 
                    else {
                        jsonObj.IP = $("#" + _Self.getPanelId() + " #inpIP").val();
                        jsonObj.Msk = $("#" + _Self.getPanelId() + " #inpMsk").val();
                        jsonObj.GW = $("#" + _Self.getPanelId() + " #inpGW").val();
                    }
                    return jsonObj;
                };

                this.toJson = function() {
                    //var md = parseInt($('#' + _Self.getPanelId() + ' input[name=IpType]:checked').val(), 10);
					var md = parseInt($('#' + _Self.getPanelId() + ' input[type=radio]:checked').val(), 10);
                    var jsonObj = {};
                    jsonObj.DHCP = md;
                    jsonObj.IP = $("#" + _Self.getPanelId() + " #inpIP").val();
                    jsonObj.Msk = $("#" + _Self.getPanelId() + " #inpMsk").val();
                    jsonObj.GW = $("#" + _Self.getPanelId() + " #inpGW").val();          
                    return jsonObj;
                };

                /*
                //In WLAN, move all ip setting to Wireless Config(/wlan_config)
                var handleSubmitted = function() {
                    $('#' + _Self.getPanelId() + " #btnNetworkConfig").click(function() {
                        if (!_Self.checkFrom()) {
                            return;
                        }
                        if ($.isFunction(_Self.onNetworkConfigSubmitted())) {
                            _Self.onNetworkConfigSubmitted()(this, _Self.toNetConfigJson());
                        }
                    });
                };
                */
                var handleHyperLink = function() {
                    $('#' + _Self.getPanelId() + ' a').click(function(e) {
                        if ($(this).hasClass('ajax-link')) {
                            e.preventDefault();
                            var url = $(this).attr('href');
                            var id = $(this).attr('id');
                            Advantech.Utility.loadAjaxContent(id, url, this);
                        } else {
                            e.preventDefault();
                        }
                    });
                };

                var handleDHCPMode = function() {
                    //$('#' + _Self.getPanelId() + ' input[name=IpType]').click(function() {
					$('#' + _Self.getPanelId() + ' input[type=radio]').click(function() {
                        var val = parseInt($('#' + _Self.getPanelId() + ' input[type=radio]:checked').val(), 10);
                        _Self.setPanelModeStatus(val);
                    });
                };

                this.initialPanel = function(containerName) {
                    try {
                        if (!this.isViewOnly()) {
                            //handleSubmitted();
                            handleDHCPMode();
                        } else {
                            handleHyperLink();
                            this.setPanelModeStatus(-1);
                        }
                    } catch (ex) {
                        alert("DoLowHighDelayTable:" + ex);
                    }
                };

                this.checkFrom = function() {
                    var result = true;
                    //if($("#" + _Self.getPanelId() + " input[name=IpType]:checked").val()==0){
					if($("#" + _Self.getPanelId() + " input[type=radio]:checked").val()==0){	
                        $('#' + _Self.getPanelId() + " input").each(function() {
                            if ($(this).hasClass("txtIp")) {
                                var id = $(this).attr('id');
                                var ip = $(this).val();
                                if (!Advantech.Utility.isValidIp(ip) && !$(this).is(":disabled")) {
                                	Advantech.Form.MessageForm.getInstance().showMessageBox("<h4>Format Error<h4>", "<h5><i class='fa fa-fw fa-exclamation-triangle'></i>Invalid IP in " + id.slice(3)+"!<h5>");
                                    $(this).val("");
                                    result = false;
                                    return result;
                                }
                            }
                        });
                        var ip = $("#" + _Self.getPanelId() + " #inpIP").val();
                        var mask = $("#" + _Self.getPanelId() + " #inpMsk").val();
                        if(!Advantech.Utility.isValidNetworkParameter(ip, mask)){
                            result = false;
                            Advantech.Form.MessageForm.getInstance().showMessageBox("<h4>Format Error<h4>", "<h5><i class='fa fa-fw fa-exclamation-triangle'></i>The combination of IP and Subnet mask is incorrect! All Host ID bits are 0 or 1.<h5>");
                        }
                    }
                    return result;
                };

                this.setNetworkConfig = function(jsonObj) {
                    try{                        
                        var wLanMode = Advantech.Data.NetworkData.WlanData.getInstance().getMode();
                        if(wLanMode != undefined){
                            $("#" + _Self.getPanelId() + " #inpWlanOpMode").val(Advantech.Profile.WlanOperationModeEmun[wLanMode]);
                        }

                        $("#" + _Self.getPanelId() + " #inpIP").val(jsonObj.IP);
                        $("#" + _Self.getPanelId() + " #inpMsk").val(jsonObj.Msk);
                        $("#" + _Self.getPanelId() + " #inpGW").val(jsonObj.GW);                        
                        $("#" + _Self.getPanelId() + " #inpMAC").val(jsonObj.MAC);
                        $("#" + _Self.getPanelId() + " input[value=" + jsonObj.DHCP + "]").prop('checked', true).trigger('click');
                    }
                    catch(e){
                        throw new Error("Setting Network panel failed.");
                    }                    
                };

                this.setPanelModeStatus = function(mode) {
                    if (mode == 0 && !this.isViewOnly()) {
                        $("#" + _Self.getPanelId() + " #inpIP").removeAttr('disabled');
                        $("#" + _Self.getPanelId() + " #inpMsk").removeAttr('disabled');
                        $("#" + _Self.getPanelId() + " #inpGW").removeAttr('disabled');
                        $("#" + _Self.getPanelId() + " .dIPIpAddressNote").hide('slow');
                    } else if (mode == 2 && !this.isViewOnly()) {
                        $("#" + _Self.getPanelId() + " #inpIP").removeAttr('disabled');
                        $("#" + _Self.getPanelId() + " #inpMsk").removeAttr('disabled');
                        $("#" + _Self.getPanelId() + " #inpGW").removeAttr('disabled');
                        $("#" + _Self.getPanelId() + " .dIPIpAddressNote").show('slow');
                    } else {
                        $("#" + _Self.getPanelId() + " #inpIP").attr('disabled', 'disabled');
                        $("#" + _Self.getPanelId() + " #inpMsk").attr('disabled', 'disabled');
                        $("#" + _Self.getPanelId() + " #inpGW").attr('disabled', 'disabled');
                        $("#" + _Self.getPanelId() + " .dIPIpAddressNote").hide('slow');
                    }
                };

                this.onNetworkConfigSubmitted = function(x) {
                    if (!arguments.length) return this._onNetworkConfigSubmitted;
                    this._onNetworkConfigSubmitted = x;
                };
            },
        	NetworkAppConfigPanel:function (panelId){
			    var _onNetworkAppConfigSubmitted = null;
			    var mContextPanelId = panelId;
			    var _Self = this;
			    this.getPanelId = function(){
			        return mContextPanelId;
			    };
			    this.initialPanel = function()
			    {
			        try{
			            var _Self = this;
			            $("#"+_Self.getPanelId()+" button").click(function(e) {
			            	e.preventDefault();
			                var type = this.id.slice(3);
			                var jsonObj = {};
			                if( type == "All"){
			                    $("#"+_Self.getPanelId()+" input").each((function(){
			                    	if(!$(this).is(":disabled")){
			                    		var prop = this.id.slice(3);
			                        	jsonObj[prop] = (this.type == 'checkbox')?((this.checked)?1:0):Number($(this).val());
			                    	}
			                    }));
			                }
			                else{
			                    $("#"+_Self.getPanelId()+" #inp"+type).each(function(){
			                            jsonObj[type] = (this.type == 'checkbox')?((this.checked)?1:0):Number($(this).val());
			                    });
			                }
			                if($.isFunction(_Self.onNetworkAppConfigSubmitted())){   
			                        _Self.onNetworkAppConfigSubmitted()(this, jsonObj);
			                }
			            });
			        }
			        catch(ex){
			            alert("NetworkAppConfigPanel:"+ex);
			        }
			    };
			    
			    this.setNetWorkAppConfig = function(jsonObj){
			    	try{
			    		for (var prop in jsonObj) {
		                    $element = $("#" + _Self.getPanelId() + " #inp" + prop);
		                    if ($element.length > 0) {
		                    	if ($element[0].type === 'checkbox') {
		                            $element.attr("checked", parseInt(jsonObj[prop], 10) == 1 ? true : false);
		                        } 
		                        else {
		                           $element.val(jsonObj[prop]);
		                        }
		                    }
		                }
			    	}
			    	catch(e){
			    		throw new Error("Setting NetworkApp panel failed")
			    	}
			         
			    };
			
			    this.onNetworkAppConfigSubmitted = function(x) {
			        if (!arguments.length) return _onNetworkAppConfigSubmitted;
			        	_onNetworkAppConfigSubmitted = x;
			    };
			}
		},
		MainForm:{
        	AdamT1X0form:function(containerId){
        			var mContainerId = containerId;
        			var mLocateStatus = true;
        			var _Self = this;
        			
        			this.getContainerId = function(){
        				return mContainerId;
        			};
        			
        			this.initialForm = function(profileObj, advancedFunctions, userTypeObj){	
        				var slotInfos = profileObjToSlotInfo(profileObj);
        				initialSoltInforamtionListView(slotInfos);
        				initialAdvancedFunctionListView(advancedFunctions);
        				var isCollapse = true;
        				var title = "<i class='fa fa-user'></i>";
        				title += (userTypeObj.Acnt == undefined)?" User ":(" "+Advantech.Profile.AccountTypeEmun[userTypeObj.Acnt]+" ");
						title +="<b class='caret'></b>";
        				$("#"+_Self.getContainerId()+ " #userTitle").html(title);
        				$("#"+_Self.getContainerId()+ " .hasMoreType").bind({
						  mouseover: function() {
						    $("#"+_Self.getContainerId()).find(this).find(" .collapse").collapse('show');
						  },
						  mouseleave:function() {
						  	$("#"+_Self.getContainerId()).find(this).find(" .collapse").collapse('hide');
						  },
						});
        			};
        			
        			this.initialEventHandle = function(){
        				$("#"+_Self.getContainerId()+" #logout").click( function(){
        					Advantech.Utility.TimerDispatchSingleton.getInstance().ClearTimer();
                            document.cookie = "adamsessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + document.domain + "; path=/";
        					Advantech.Utility.switchToTagetHtml("index",ABSOLUTE_PATH);
        				});
					    $("#"+_Self.getContainerId()+' .navbar-brand').on('click', 'a', function (e) {
					        if($(this).hasClass('ajax-home'))
					        {
					        	e.preventDefault();
					        	Advantech.Utility.switchToTagetHtml("index",ABSOLUTE_PATH+"/index.html");
					        }
					    });
					    $("#"+_Self.getContainerId()+' .top-nav').on('click', 'a', function (e) {
					        if ($(this).hasClass('ajax-link')) {
					            e.preventDefault();
					            var url = $(this).attr('href');
					            var id = $(this).attr('id');
					            var ret = Advantech.Utility.loadAjaxContent(id, url, this);
					            if(ret && $(".navbar-toggle").is(":visible"))
					                $('#collapseableNavbar').collapse('hide');
					        }
					    });
					    $("#"+_Self.getContainerId()+' .main-menu').on('click', 'a', function (e) {
					        if ($(this).hasClass('ajax-link')) {
					            e.preventDefault();
					            var url = $(this).attr('href');
					            var id = $(this).attr('id');
					            var ret = Advantech.Utility.loadAjaxContent(id, url, this);
					            if(ret && $(".navbar-toggle").is(":visible"))
					                $('#collapseableNavbar').collapse('hide');
					        }
					        else if($(this).hasClass('ajax-home')){
					        	e.preventDefault();
					        	Advantech.Utility.switchToTagetHtml("index",ABSOLUTE_PATH+"/index.html");
					        }
					        else{
					        	e.preventDefault();
					        }
					            
					    });
	        		};
        			
        			var profileObjToSlotInfo = function(profileObj){
					    return null;
					};
										
        			var initialSoltInforamtionListView = function (slotInfos){
        				var htmlCode = '';
					    htmlCode += "<a href ='"+ABSOLUTE_PATH+"/io_status.html' id ='ioStatus0' class ='ajax-link'>";
					    htmlCode += "<i class='fa fa-fw fa-bar-chart-o'></i> I/O Status";
					    htmlCode += "</a>";
					    $("#"+_Self.getContainerId()+" #soltInfoListViewItem").append(htmlCode);
					};
					
					var addSlotInfoListItem = function (slotIndex, deviceName){
					    var htmlCode = '';
					    htmlCode += "<li>"; 
					    htmlCode +=  "<a id ='ioStatus_"+slotIndex+"' href='"+ABSOLUTE_PATH+"/io_status.html' class='ajax-link'>(Solt " 
					                    + slotIndex +")"
					                    + deviceName +"</a>";	     
					    htmlCode += "</li>";  
					     return htmlCode;
					};
					
					var initialAdvancedFunctionListView = function (advancedFunctions){
					    if( advancedFunctions != null){
					        for( var i = 0; i< advancedFunctions.length; ++i)
					        	$("#"+_Self.getContainerId()+" #advanced").append(addAdvancedFunctionList(advancedFunctions[i].getPageID(),
					                                    						                          advancedFunctions[i].getPageHref(),
					                                                                                      advancedFunctions[i].getListviewContext()));
					    }
					};
					
					var addAdvancedFunctionList = function (id, href, context){
					    var htmlCode = '';
					    htmlCode += "<li>";  
					    htmlCode += ("<a id ='"+id+"' href='"+ABSOLUTE_PATH+"/"+ href+"' class='ajax-link'>"+context+"</a>");  
					    htmlCode += "</li>";
					    return htmlCode;  
					};
        		},
        	},
	},
    Data:{
            ModuleData:(function(){
                var mInstance; //private variable to hold the only instance that will exits.
                var moduleWorkingMode = function() {
                    var mMode = 0; //private
                    var setMode = function(mode) {
                        mMode = mode;
                    };
                    var getMode = function() {
                        return mMode;
                    };
                    return {
                        setMode: setMode,
                        getMode: getMode
                    };
                };

                return {
                    getInstance: function() {
                        if (!mInstance) {
                            mInstance = moduleWorkingMode();
                        }
                        return mInstance;
                    }
                };
          })(),
        NetworkData:{
            WlanData:(function(){
                var mInstance; //private variable to hold the only instance that will exits.
                var wlanOpMode = function() {
                    var mMode = 0; //private
                    var setMode = function(mode) {
                        mMode = mode;
                    };
                    var getMode = function() {
                        return mMode;
                    };
                    return {
                        setMode: setMode,
                        getMode: getMode
                    };
                };

                return {
                    getInstance: function() {
                        if (!mInstance) {
                            mInstance = wlanOpMode();
                        }
                        return mInstance;
                    }
                };
          })(),
        },
    }    
});

module.exports = {
  Advantech : Advantech,
};


