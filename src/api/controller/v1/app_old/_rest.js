/* eslint-disable no-console,prefer-reflect */
const path = require('path');
const assert = require('assert');

module.exports = class extends think.Controller {
  constructor(ctx) {
    super(ctx);
    // 从缓存中获取机构列表

    this.resource = this.getResource();
    this.id = this.getId();
    assert(think.isFunction(this.model), 'this.model must be a function');

    this.modelInstance = this.model(this.resource);
  }
  async __before() {
    this.appId = this.get('appId')
    this.cachePrefix = 'picker_' + this.appId + '_'
    if (!think.isEmpty(this.appId)) {
      this.modelInstance = this.model(this.resource, {appId: this.appId});
    }
  }
  /**
   * get resource
   * @return {String} [resource name]
   */
  getResource() {
    const filename = this.__filename || __filename;
    const last = filename.lastIndexOf(path.sep);
    return filename.substr(last + 1, filename.length - last - 4);
  }
  getId() {
    const id = this.get('id');
    if (id && (think.isString(id) || think.isNumber(id))) {
      return id;
    }
    const last = this.ctx.path.split('/').slice(-1)[0];
    if (last !== this.resource) {
      return last;
    }
    return '';
  }
  async getAction() {
    let data;
    if (this.id) {
      const pk = this.modelInstance.pk;
      data = await this.modelInstance.where({[pk]: this.id}).find();
      return this.success(data);
    }
    data = await this.modelInstance.select();
    return this.success(data);
  }
  /**
   * put resource
   * @return {Promise} []
   */
  async postAction() {
    const data = this.post();
    delete data[await this.modelInstance.pk];
    if (think.isEmpty(data)) {
      return this.fail('data is empty');
    }
    const insertId = await this.modelInstance.add(data);
    return this.success({id: insertId});
  }
  /**
   * delete resource
   * @return {Promise} []
   */
  async deleteAction() {
    if (!this.id) {
      return this.fail('params error');
    }
    const pk = this.modelInstance.pk;
    const rows = await this.modelInstance.where({[pk]: this.id}).delete();
    return this.success({affectedRows: rows});
  }
  /**
   * update resource
   * @return {Promise} []
   */
  async putAction() {
    if (!this.id) {
      return this.fail('params error');
    }
    const pk = this.modelInstance.pk;
    // const pk = await this.modelInstance.getPk();
    const data = this.post();
    delete data[pk];
    if (think.isEmpty(data)) {
      return this.fail('data is empty');
    }
    const rows = await this.modelInstance.where({[pk]: this.id}).update(data);
    return this.success({affectedRows: rows});
  }
  __call() {

  }
};
