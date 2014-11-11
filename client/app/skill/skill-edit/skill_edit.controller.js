'use strict';

angular.module('cookApp')
	.controller('SkillEditCtrl', function($scope, $stateParams, $state, $http, skillTagFactory) {
		var type = $stateParams.type;
		var self = this;
		this.blurb="";
		this.overview="";
		this.new_tip="";
		this.tips=[];
		this.skill;
		if(!!skillTagFactory.getSkill()){
			var skill=skillTagFactory.getSkill();
			self.skill = skill;
			self.blurb = skill.page.blurb;
			self.overview = skill.page.overview;
			if(!!skill.page.tips) {
				self.tips = skill.page.tips;
			}
		} else if(!!type) {
			skillTagFactory.setSkill(type, function(skill){
				self.skill = skill;
				self.blurb = skill.page.blurb;
				self.overview = skill.page.overview;
				if(!!skill.page.tips) {
					self.tips = skill.page.tips;
				}
			});
		} else {
			$state.go('profile');
		}

		this.addTip = function(){
			if(this.new_tip.trim().length>0){
				this.tips.push(this.new_tip.trim());
				this.new_tip="";
			}
		};

		this.removeTip = function(tip_text){
			var index = this.tips.indexOf(tip_text);
			if(index!==-1){
				this.tips.splice(index,1);
			}
		};

		this.saveChanges = function(){
			var saveObj = {
				blurb: this.blurb,
				overview: this.overview,
				tips: this.tips,
				id:this.skill._id
			}
			$http.post('/api/sources/tags/pageUpdate', saveObj)
				.success(function(res){
					$state.go('skill', {'type':res._id});
				});
		};
	});