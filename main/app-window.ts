var __extends = (this && this.__extends) || (function () {
  var extendStatics = function (d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };
  return function (d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
      }
      return t;
  };
  return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
              case 0: case 1: t = op; break;
              case 4: _.label++; return { value: op[1], done: false };
              case 5: _.label++; y = op[1]; op = [0]; continue;
              case 7: op = _.ops.pop(); _.trys.pop(); continue;
              default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                  if (t[2]) _.ops.pop();
                  _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
};
define(["require", "exports", "electron", "path", "os", "node-window-manager", "mouse-hooks", "./view-manager", "~/shared/utils/paths", "fs", "./models/process-window", "~/renderer/app/constants", "."], function (require, exports, electron_1, path_1, os_1, node_window_manager_1, mouse_hooks_1, view_manager_1, paths_1, fs_1, process_window_1, constants_1, _1) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var containsPoint = function (bounds, point) {
      return (point.x >= bounds.x &&
          point.y >= bounds.y &&
          point.x <= bounds.x + bounds.width &&
          point.y <= bounds.y + bounds.height);
  };
  var AppWindow = /** @class */ (function (_super) {
      __extends(AppWindow, _super);
      function AppWindow() {
          var _this = _super.call(this, {
              frame: process.env.ENV === 'dev' || os_1.platform() === 'darwin',
              minWidth: 400,
              minHeight: 450,
              width: 900,
              height: 700,
              show: false,
              titleBarStyle: 'hiddenInset',
              webPreferences: {
                  plugins: true,
                  nodeIntegration: true,
                  contextIsolation: false,
                  experimentalFeatures: true,
              },
              icon: path_1.resolve(electron_1.app.getAppPath(), 'static/app-icons/icon.png'),
          }) || this;
          _this.viewManager = new view_manager_1.ViewManager();
          _this.windows = [];
          _this.draggedIn = false;
          _this.detached = false;
          _this.isMoving = false;
          _this.isUpdatingContentBounds = false;
          _this.willAttachWindow = false;
          _this.isWindowHidden = false;
          _this.intervalCallback = function () {
              if (_this.isMoving)
                  return;
              if (!_this.isMinimized()) {
                  for (var _i = 0, _a = _this.windows; _i < _a.length; _i++) {
                      var window = _a[_i];
                      var title = window.getTitle();
                      if (window.lastTitle !== title) {
                          _this.webContents.send('update-tab-title', {
                              id: window.handle,
                              title: title,
                          });
                          window.lastTitle = title;
                      }
                      if (!window.isWindow()) {
                          _this.detachWindow(window);
                          _this.webContents.send('remove-tab', window.handle);
                      }
                  }
                  if (_this.selectedWindow) {
                      var contentBounds = _this.getContentArea();
                      var bounds = _this.selectedWindow.getBounds();
                      var lastBounds = _this.selectedWindow.lastBounds;
                      if ((contentBounds.x !== bounds.x || contentBounds.y !== bounds.y) &&
                          (bounds.width === lastBounds.width &&
                              bounds.height === lastBounds.height)) {
                          var window = _this.selectedWindow;
                          _this.detachWindow(window);
                          _this.detached = true;
                      }
                  }
              }
              if (!_this.isMinimized() &&
                  _this.draggedWindow &&
                  _this.draggedWindow.getParent().handle === 0 &&
                  !_this.windows.find(function (x) { return x.handle === _this.draggedWindow.handle; })) {
                  var winBounds = _this.draggedWindow.getBounds();
                  var lastBounds = _this.draggedWindow.lastBounds;
                  var contentBounds = _this.getContentArea();
                  var cursor = node_window_manager_1.windowManager.getMousePoint();
                  cursor.y = winBounds.y;
                  contentBounds.y -= constants_1.TOOLBAR_HEIGHT;
                  contentBounds.height = 2 * constants_1.TOOLBAR_HEIGHT;
                  if (!_this.detached &&
                      containsPoint(contentBounds, cursor) &&
                      (winBounds.x !== lastBounds.x || winBounds.y !== lastBounds.y)) {
                      if (!_this.draggedIn) {
                          var title_1 = _this.draggedWindow.getTitle();
                          electron_1.app.getFileIcon(_this.draggedWindow.process.path, function (err, icon) {
                              if (err)
                                  return _1.log.error(err);
                              _this.draggedWindow.lastTitle = title_1;
                              _this.webContents.send('add-tab', {
                                  id: _this.draggedWindow.handle,
                                  title: title_1,
                                  icon: icon.toPNG(),
                              });
                              _this.draggedIn = true;
                              _this.willAttachWindow = true;
                          });
                      }
                  }
                  else if (_this.draggedIn && !_this.detached) {
                      _this.webContents.send('remove-tab', _this.draggedWindow.handle);
                      _this.draggedIn = false;
                      _this.willAttachWindow = false;
                  }
              }
          };
          var windowDataPath = paths_1.getPath('window-data.json');
          var windowState = {};
          if (fs_1.existsSync(windowDataPath)) {
              try {
                  // Read the last window state from file.
                  windowState = JSON.parse(fs_1.readFileSync(windowDataPath, 'utf8'));
              }
              catch (e) {
                  fs_1.writeFileSync(windowDataPath, JSON.stringify({}));
              }
          }
          // Merge bounds from the last window state to the current window options.
          if (windowState) {
              _this.setBounds(__assign({}, windowState.bounds));
          }
          if (windowState) {
              if (windowState.maximized) {
                  _this.maximize();
              }
              if (windowState.fullscreen) {
                  _this.setFullScreen(true);
              }
          }
          // Update window bounds on resize and on move when window is not maximized.
          _this.on('resize', function () {
              if (!_this.isMaximized()) {
                  windowState.bounds = _this.getBounds();
              }
          });
          _this.on('move', function () {
              if (!_this.isMaximized()) {
                  windowState.bounds = _this.getBounds();
              }
          });
          var resize = function () {
              _this.viewManager.fixBounds();
              _this.webContents.send('tabs-resize');
          };
          _this.on('maximize', resize);
          _this.on('restore', resize);
          _this.on('unmaximize', resize);
          // Save current window state to file.
          _this.on('close', function () {
              windowState.maximized = _this.isMaximized();
              windowState.fullscreen = _this.isFullScreen();
              fs_1.writeFileSync(windowDataPath, JSON.stringify(windowState));
          });
          if (process.env.ENV === 'dev') {
              _this.webContents.openDevTools({ mode: 'detach' });
              _this.loadURL('http://localhost:4444/app.html');
          }
          else {
              _this.loadURL(path_1.join('file://', electron_1.app.getAppPath(), 'build/app.html'));
          }
          _this.once('ready-to-show', function () {
              _this.show();
          });
          _this.on('enter-full-screen', function () {
              _this.webContents.send('fullscreen', true);
              _this.viewManager.fixBounds();
          });
          _this.on('leave-full-screen', function () {
              _this.webContents.send('fullscreen', false);
              _this.viewManager.fixBounds();
          });
          _this.on('enter-html-full-screen', function () {
              _this.viewManager.fullscreen = true;
              _this.webContents.send('html-fullscreen', true);
          });
          _this.on('leave-html-full-screen', function () {
              _this.viewManager.fullscreen = false;
              _this.webContents.send('html-fullscreen', false);
          });
          _this.on('scroll-touch-begin', function () {
              _this.webContents.send('scroll-touch-begin');
          });
          _this.on('scroll-touch-end', function () {
              _this.viewManager.selected.webContents.send('scroll-touch-end');
              _this.webContents.send('scroll-touch-end');
          });
          if (os_1.platform() === 'win32') {
              _this.activateWindowCapturing();
          }
          return _this;
      }
      AppWindow.prototype.activateWindowCapturing = function () {
          var _this = this;
          var updateBounds = function () {
              _this.isMoving = true;
              if (!_this.isUpdatingContentBounds) {
                  _this.resizeWindow(_this.selectedWindow);
              }
          };
          var handle = this.getNativeWindowHandle().readInt32LE(0);
          this.window = new node_window_manager_1.Window(handle);
          this.on('move', updateBounds);
          this.on('resize', updateBounds);
          this.on('close', function () {
              for (var _i = 0, _a = _this.windows; _i < _a.length; _i++) {
                  var window = _a[_i];
                  _this.detachWindow(window);
              }
          });
          this.interval = setInterval(this.intervalCallback, 100);
          electron_1.ipcMain.on('select-window', function (e, id) {
              _this.selectWindow(_this.windows.find(function (x) { return x.handle === id; }));
          });
          electron_1.ipcMain.on('detach-window', function (e, id) {
              _this.detachWindow(_this.windows.find(function (x) { return x.handle === id; }));
          });
          electron_1.ipcMain.on('hide-window', function () {
              if (_this.selectedWindow) {
                  _this.selectedWindow.hide();
                  _this.isWindowHidden = true;
              }
          });
          node_window_manager_1.windowManager.on('window-activated', function (window) {
              _this.webContents.send('select-tab', window.handle);
              if (window.handle === handle ||
                  (_this.selectedWindow && window.handle === _this.selectedWindow.handle)) {
                  if (!electron_1.globalShortcut.isRegistered('CmdOrCtrl+Tab')) {
                      electron_1.globalShortcut.register('CmdOrCtrl+Tab', function () {
                          _this.webContents.send('next-tab');
                      });
                  }
              }
              else if (electron_1.globalShortcut.isRegistered('CmdOrCtrl+Tab')) {
                  electron_1.globalShortcut.unregister('CmdOrCtrl+Tab');
              }
          });
          mouse_hooks_1.default.on('mouse-down', function () {
              if (_this.isMinimized())
                  return;
              setTimeout(function () {
                  _this.draggedWindow = new process_window_1.ProcessWindow(node_window_manager_1.windowManager.getActiveWindow().handle);
                  if (_this.draggedWindow.handle === handle) {
                      _this.draggedWindow = null;
                      return;
                  }
              }, 50);
          });
          mouse_hooks_1.default.on('mouse-up', function (data) { return __awaiter(_this, void 0, void 0, function () {
              var bounds, lastBounds, sf, win_1;
              var _this = this;
              return __generator(this, function (_a) {
                  if (this.selectedWindow && !this.isMoving) {
                      bounds = this.selectedWindow.getBounds();
                      lastBounds = this.selectedWindow.lastBounds;
                      if (!this.isMaximized() &&
                          (bounds.width !== lastBounds.width ||
                              bounds.height !== lastBounds.height)) {
                          this.isUpdatingContentBounds = true;
                          clearInterval(this.interval);
                          sf = node_window_manager_1.windowManager.getScaleFactor(node_window_manager_1.windowManager.getMonitorFromWindow(this.window));
                          this.selectedWindow.lastBounds = bounds;
                          bounds.width = Math.round(bounds.width / sf);
                          bounds.height = Math.round(bounds.height / sf);
                          bounds.x = Math.round(bounds.x / sf);
                          bounds.y = Math.round(bounds.y / sf);
                          this.setContentBounds({
                              width: bounds.width,
                              height: bounds.height + constants_1.TOOLBAR_HEIGHT,
                              x: bounds.x,
                              y: bounds.y - constants_1.TOOLBAR_HEIGHT - 1,
                          });
                          this.interval = setInterval(this.intervalCallback, 100);
                          this.isUpdatingContentBounds = false;
                      }
                  }
                  this.isMoving = false;
                  if (this.draggedWindow && this.willAttachWindow) {
                      win_1 = this.draggedWindow;
                      win_1.setParent(this.window);
                      this.windows.push(win_1);
                      this.willAttachWindow = false;
                      setTimeout(function () {
                          _this.selectWindow(win_1);
                      }, 50);
                  }
                  this.draggedWindow = null;
                  this.detached = false;
                  return [2 /*return*/];
              });
          }); });
      };
      AppWindow.prototype.getContentArea = function () {
          var bounds = this.getContentBounds();
          bounds.y += constants_1.TOOLBAR_HEIGHT;
          bounds.height -= constants_1.TOOLBAR_HEIGHT;
          var sf = node_window_manager_1.windowManager.getScaleFactor(node_window_manager_1.windowManager.getMonitorFromWindow(this.window));
          bounds.x = Math.round(bounds.x * sf);
          bounds.y = Math.round(bounds.y * sf) + 1;
          bounds.width = Math.round(bounds.width * sf);
          bounds.height = Math.round(bounds.height * sf) - 1;
          return bounds;
      };
      AppWindow.prototype.selectWindow = function (window) {
          if (!window)
              return;
          if (this.selectedWindow) {
              if (window.handle === this.selectedWindow.handle &&
                  !this.isWindowHidden) {
                  return;
              }
              this.selectedWindow.hide();
          }
          window.show();
          this.selectedWindow = window;
          this.isWindowHidden = false;
          this.resizeWindow(window);
      };
      AppWindow.prototype.resizeWindow = function (window) {
          if (!window || this.isMinimized())
              return;
          var newBounds = this.getContentArea();
          window.setBounds(newBounds);
          window.lastBounds = newBounds;
          var bounds = window.getBounds();
          if (bounds.width > newBounds.width || bounds.height > newBounds.height) {
              this.setContentSize(bounds.width, bounds.height + constants_1.TOOLBAR_HEIGHT);
              this.setMinimumSize(bounds.width, bounds.height + constants_1.TOOLBAR_HEIGHT);
          }
      };
      AppWindow.prototype.detachWindow = function (window) {
          if (!window)
              return;
          if (this.selectedWindow === window) {
              this.selectedWindow = null;
          }
          window.detach();
          this.windows = this.windows.filter(function (x) { return x.handle !== window.handle; });
      };
      return AppWindow;
  }(electron_1.BrowserWindow));
  exports.AppWindow = AppWindow;
});
var __extends = (this && this.__extends) || (function () {
  var extendStatics = function (d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };
  return function (d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
      }
      return t;
  };
  return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
              case 0: case 1: t = op; break;
              case 4: _.label++; return { value: op[1], done: false };
              case 5: _.label++; y = op[1]; op = [0]; continue;
              case 7: op = _.ops.pop(); _.trys.pop(); continue;
              default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                  if (t[2]) _.ops.pop();
                  _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
};
define(["require", "exports", "electron", "path", "os", "node-window-manager", "mouse-hooks", "./view-manager", "~/shared/utils/paths", "fs", "./models/process-window", "~/renderer/app/constants", "."], function (require, exports, electron_1, path_1, os_1, node_window_manager_1, mouse_hooks_1, view_manager_1, paths_1, fs_1, process_window_1, constants_1, _1) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var containsPoint = function (bounds, point) {
      return (point.x >= bounds.x &&
          point.y >= bounds.y &&
          point.x <= bounds.x + bounds.width &&
          point.y <= bounds.y + bounds.height);
  };
  var AppWindow = /** @class */ (function (_super) {
      __extends(AppWindow, _super);
      function AppWindow() {
          var _this = _super.call(this, {
              frame: process.env.ENV === 'dev' || os_1.platform() === 'darwin',
              minWidth: 400,
              minHeight: 450,
              width: 900,
              height: 700,
              show: false,
              titleBarStyle: 'hiddenInset',
              webPreferences: {
                  plugins: true,
                  nodeIntegration: true,
                  contextIsolation: false,
                  experimentalFeatures: true,
              },
              icon: path_1.resolve(electron_1.app.getAppPath(), 'static/app-icons/icon.png'),
          }) || this;
          _this.viewManager = new view_manager_1.ViewManager();
          _this.windows = [];
          _this.draggedIn = false;
          _this.detached = false;
          _this.isMoving = false;
          _this.isUpdatingContentBounds = false;
          _this.willAttachWindow = false;
          _this.isWindowHidden = false;
          _this.intervalCallback = function () {
              if (_this.isMoving)
                  return;
              if (!_this.isMinimized()) {
                  for (var _i = 0, _a = _this.windows; _i < _a.length; _i++) {
                      var window = _a[_i];
                      var title = window.getTitle();
                      if (window.lastTitle !== title) {
                          _this.webContents.send('update-tab-title', {
                              id: window.handle,
                              title: title,
                          });
                          window.lastTitle = title;
                      }
                      if (!window.isWindow()) {
                          _this.detachWindow(window);
                          _this.webContents.send('remove-tab', window.handle);
                      }
                  }
                  if (_this.selectedWindow) {
                      var contentBounds = _this.getContentArea();
                      var bounds = _this.selectedWindow.getBounds();
                      var lastBounds = _this.selectedWindow.lastBounds;
                      if ((contentBounds.x !== bounds.x || contentBounds.y !== bounds.y) &&
                          (bounds.width === lastBounds.width &&
                              bounds.height === lastBounds.height)) {
                          var window = _this.selectedWindow;
                          _this.detachWindow(window);
                          _this.detached = true;
                      }
                  }
              }
              if (!_this.isMinimized() &&
                  _this.draggedWindow &&
                  _this.draggedWindow.getParent().handle === 0 &&
                  !_this.windows.find(function (x) { return x.handle === _this.draggedWindow.handle; })) {
                  var winBounds = _this.draggedWindow.getBounds();
                  var lastBounds = _this.draggedWindow.lastBounds;
                  var contentBounds = _this.getContentArea();
                  var cursor = node_window_manager_1.windowManager.getMousePoint();
                  cursor.y = winBounds.y;
                  contentBounds.y -= constants_1.TOOLBAR_HEIGHT;
                  contentBounds.height = 2 * constants_1.TOOLBAR_HEIGHT;
                  if (!_this.detached &&
                      containsPoint(contentBounds, cursor) &&
                      (winBounds.x !== lastBounds.x || winBounds.y !== lastBounds.y)) {
                      if (!_this.draggedIn) {
                          var title_1 = _this.draggedWindow.getTitle();
                          electron_1.app.getFileIcon(_this.draggedWindow.process.path, function (err, icon) {
                              if (err)
                                  return _1.log.error(err);
                              _this.draggedWindow.lastTitle = title_1;
                              _this.webContents.send('add-tab', {
                                  id: _this.draggedWindow.handle,
                                  title: title_1,
                                  icon: icon.toPNG(),
                              });
                              _this.draggedIn = true;
                              _this.willAttachWindow = true;
                          });
                      }
                  }
                  else if (_this.draggedIn && !_this.detached) {
                      _this.webContents.send('remove-tab', _this.draggedWindow.handle);
                      _this.draggedIn = false;
                      _this.willAttachWindow = false;
                  }
              }
          };
          var windowDataPath = paths_1.getPath('window-data.json');
          var windowState = {};
          if (fs_1.existsSync(windowDataPath)) {
              try {
                  // Read the last window state from file.
                  windowState = JSON.parse(fs_1.readFileSync(windowDataPath, 'utf8'));
              }
              catch (e) {
                  fs_1.writeFileSync(windowDataPath, JSON.stringify({}));
              }
          }
          // Merge bounds from the last window state to the current window options.
          if (windowState) {
              _this.setBounds(__assign({}, windowState.bounds));
          }
          if (windowState) {
              if (windowState.maximized) {
                  _this.maximize();
              }
              if (windowState.fullscreen) {
                  _this.setFullScreen(true);
              }
          }
          // Update window bounds on resize and on move when window is not maximized.
          _this.on('resize', function () {
              if (!_this.isMaximized()) {
                  windowState.bounds = _this.getBounds();
              }
          });
          _this.on('move', function () {
              if (!_this.isMaximized()) {
                  windowState.bounds = _this.getBounds();
              }
          });
          var resize = function () {
              _this.viewManager.fixBounds();
              _this.webContents.send('tabs-resize');
          };
          _this.on('maximize', resize);
          _this.on('restore', resize);
          _this.on('unmaximize', resize);
          // Save current window state to file.
          _this.on('close', function () {
              windowState.maximized = _this.isMaximized();
              windowState.fullscreen = _this.isFullScreen();
              fs_1.writeFileSync(windowDataPath, JSON.stringify(windowState));
          });
          if (process.env.ENV === 'dev') {
              _this.webContents.openDevTools({ mode: 'detach' });
              _this.loadURL('http://localhost:4444/app.html');
          }
          else {
              _this.loadURL(path_1.join('file://', electron_1.app.getAppPath(), 'build/app.html'));
          }
          _this.once('ready-to-show', function () {
              _this.show();
          });
          _this.on('enter-full-screen', function () {
              _this.webContents.send('fullscreen', true);
              _this.viewManager.fixBounds();
          });
          _this.on('leave-full-screen', function () {
              _this.webContents.send('fullscreen', false);
              _this.viewManager.fixBounds();
          });
          _this.on('enter-html-full-screen', function () {
              _this.viewManager.fullscreen = true;
              _this.webContents.send('html-fullscreen', true);
          });
          _this.on('leave-html-full-screen', function () {
              _this.viewManager.fullscreen = false;
              _this.webContents.send('html-fullscreen', false);
          });
          _this.on('scroll-touch-begin', function () {
              _this.webContents.send('scroll-touch-begin');
          });
          _this.on('scroll-touch-end', function () {
              _this.viewManager.selected.webContents.send('scroll-touch-end');
              _this.webContents.send('scroll-touch-end');
          });
          if (os_1.platform() === 'win32') {
              _this.activateWindowCapturing();
          }
          return _this;
      }
      AppWindow.prototype.activateWindowCapturing = function () {
          var _this = this;
          var updateBounds = function () {
              _this.isMoving = true;
              if (!_this.isUpdatingContentBounds) {
                  _this.resizeWindow(_this.selectedWindow);
              }
          };
          var handle = this.getNativeWindowHandle().readInt32LE(0);
          this.window = new node_window_manager_1.Window(handle);
          this.on('move', updateBounds);
          this.on('resize', updateBounds);
          this.on('close', function () {
              for (var _i = 0, _a = _this.windows; _i < _a.length; _i++) {
                  var window = _a[_i];
                  _this.detachWindow(window);
              }
          });
          this.interval = setInterval(this.intervalCallback, 100);
          electron_1.ipcMain.on('select-window', function (e, id) {
              _this.selectWindow(_this.windows.find(function (x) { return x.handle === id; }));
          });
          electron_1.ipcMain.on('detach-window', function (e, id) {
              _this.detachWindow(_this.windows.find(function (x) { return x.handle === id; }));
          });
          electron_1.ipcMain.on('hide-window', function () {
              if (_this.selectedWindow) {
                  _this.selectedWindow.hide();
                  _this.isWindowHidden = true;
              }
          });
          node_window_manager_1.windowManager.on('window-activated', function (window) {
              _this.webContents.send('select-tab', window.handle);
              if (window.handle === handle ||
                  (_this.selectedWindow && window.handle === _this.selectedWindow.handle)) {
                  if (!electron_1.globalShortcut.isRegistered('CmdOrCtrl+Tab')) {
                      electron_1.globalShortcut.register('CmdOrCtrl+Tab', function () {
                          _this.webContents.send('next-tab');
                      });
                  }
              }
              else if (electron_1.globalShortcut.isRegistered('CmdOrCtrl+Tab')) {
                  electron_1.globalShortcut.unregister('CmdOrCtrl+Tab');
              }
          });
          mouse_hooks_1.default.on('mouse-down', function () {
              if (_this.isMinimized())
                  return;
              setTimeout(function () {
                  _this.draggedWindow = new process_window_1.ProcessWindow(node_window_manager_1.windowManager.getActiveWindow().handle);
                  if (_this.draggedWindow.handle === handle) {
                      _this.draggedWindow = null;
                      return;
                  }
              }, 50);
          });
          mouse_hooks_1.default.on('mouse-up', function (data) { return __awaiter(_this, void 0, void 0, function () {
              var bounds, lastBounds, sf, win_1;
              var _this = this;
              return __generator(this, function (_a) {
                  if (this.selectedWindow && !this.isMoving) {
                      bounds = this.selectedWindow.getBounds();
                      lastBounds = this.selectedWindow.lastBounds;
                      if (!this.isMaximized() &&
                          (bounds.width !== lastBounds.width ||
                              bounds.height !== lastBounds.height)) {
                          this.isUpdatingContentBounds = true;
                          clearInterval(this.interval);
                          sf = node_window_manager_1.windowManager.getScaleFactor(node_window_manager_1.windowManager.getMonitorFromWindow(this.window));
                          this.selectedWindow.lastBounds = bounds;
                          bounds.width = Math.round(bounds.width / sf);
                          bounds.height = Math.round(bounds.height / sf);
                          bounds.x = Math.round(bounds.x / sf);
                          bounds.y = Math.round(bounds.y / sf);
                          this.setContentBounds({
                              width: bounds.width,
                              height: bounds.height + constants_1.TOOLBAR_HEIGHT,
                              x: bounds.x,
                              y: bounds.y - constants_1.TOOLBAR_HEIGHT - 1,
                          });
                          this.interval = setInterval(this.intervalCallback, 100);
                          this.isUpdatingContentBounds = false;
                      }
                  }
                  this.isMoving = false;
                  if (this.draggedWindow && this.willAttachWindow) {
                      win_1 = this.draggedWindow;
                      win_1.setParent(this.window);
                      this.windows.push(win_1);
                      this.willAttachWindow = false;
                      setTimeout(function () {
                          _this.selectWindow(win_1);
                      }, 50);
                  }
                  this.draggedWindow = null;
                  this.detached = false;
                  return [2 /*return*/];
              });
          }); });
      };
      AppWindow.prototype.getContentArea = function () {
          var bounds = this.getContentBounds();
          bounds.y += constants_1.TOOLBAR_HEIGHT;
          bounds.height -= constants_1.TOOLBAR_HEIGHT;
          var sf = node_window_manager_1.windowManager.getScaleFactor(node_window_manager_1.windowManager.getMonitorFromWindow(this.window));
          bounds.x = Math.round(bounds.x * sf);
          bounds.y = Math.round(bounds.y * sf) + 1;
          bounds.width = Math.round(bounds.width * sf);
          bounds.height = Math.round(bounds.height * sf) - 1;
          return bounds;
      };
      AppWindow.prototype.selectWindow = function (window) {
          if (!window)
              return;
          if (this.selectedWindow) {
              if (window.handle === this.selectedWindow.handle &&
                  !this.isWindowHidden) {
                  return;
              }
              this.selectedWindow.hide();
          }
          window.show();
          this.selectedWindow = window;
          this.isWindowHidden = false;
          this.resizeWindow(window);
      };
      AppWindow.prototype.resizeWindow = function (window) {
          if (!window || this.isMinimized())
              return;
          var newBounds = this.getContentArea();
          window.setBounds(newBounds);
          window.lastBounds = newBounds;
          var bounds = window.getBounds();
          if (bounds.width > newBounds.width || bounds.height > newBounds.height) {
              this.setContentSize(bounds.width, bounds.height + constants_1.TOOLBAR_HEIGHT);
              this.setMinimumSize(bounds.width, bounds.height + constants_1.TOOLBAR_HEIGHT);
          }
      };
      AppWindow.prototype.detachWindow = function (window) {
          if (!window)
              return;
          if (this.selectedWindow === window) {
              this.selectedWindow = null;
          }
          window.detach();
          this.windows = this.windows.filter(function (x) { return x.handle !== window.handle; });
      };
      return AppWindow;
  }(electron_1.BrowserWindow));
  exports.AppWindow = AppWindow;
});
