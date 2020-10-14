/**
* by lianbo.guo
 * @Description 通用Error类
 * 如方法设计为异步请直接实例并throw该类暴露错误
 * 如方法设计为同步，根据需求可直接将实例返回或throw
 * TODO: 错误上报通用封装
 */
import ErrorStatus from './ErrorStatus';

class ErrorMessage extends Error {
  public status: number;
  public isPublic: boolean;
  public userData: any;

  constructor(message, status = ErrorStatus.ILLEGAL, isPublic = false) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.isPublic = isPublic;
    if (Object.hasOwnProperty.call(Error, 'captureStackTrace')) {
      (Error as any).captureStackTrace(this, this.constructor.name);
    }
  }
}

export default ErrorMessage;
