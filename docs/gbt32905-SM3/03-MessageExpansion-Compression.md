# SM3 消息扩展与压缩函数 (GB/T 32905 §5.2-§5.3)

来源: GB/T 32905-2016

消息扩展 W/W' + 64轮压缩函数迭代


5.2 消息扩展

   将消息分组 B (i)按以下方法扩展 生 成 132 个 消 息 字 W 0 ,
                                          W 1 ,…W 67 ,
                                                     W'0,
                                                        W'1,…W'
                                                              63 ,用于压缩函
数 CF :
   第一步,将消息分组 B (i)划分为 16 个字 W 0 ,
                                W 1 ,…W 15 。
   第二步,
   FOR j=16 TO 67
      Wi 􀲓P1(
            Wi-16 􀱇Wi-9 􀱇 (
                          Wi-3 <<<15))􀱇 (
                                        Wi-13 <<<7)􀱇Wi-6ENDFOR
   第三步,
   FOR j=0 TO 63
          i =Wi 􀱇Wi+4
         W'
   ENDFOR

 3.
5.3 压缩函数

   令 A,
      B,C,
         D,E,
            F,G ,H 为 字 寄 存 器,
                            SS1,
                               SS2,
                                  TT1,
                                     TT2 为 中 间 变 量,压 缩 函 数 Vi+1 =
CF (
   Vi ,
      B i ),
           0≤i≤n-1。计算过程描述如下:
    ()    ()



   ABCDEFGH 􀲓V i
                   ()


   FOR j=0 TO 63
      SS1􀲓 ((
            A <<<12)+E + (
                         Ti <<< (
                                jmod32)))<<<7
         SS2􀲓SS1􀱇 (
                  A <<<12)
         TT1􀲓FFi(A,B,C)+D +SS2+W'
                                i

         TT2􀲓GGi(
                E,F,
                   G )+H +SS1+Wi
         D 􀲓C
         C 􀲓B <<<9
         B 􀲓A
         A 􀲓TT1
         H 􀲓G
         G 􀲓F <<<19
                                                                     3
GB/T 32905—2016

           F 􀲓E
           E 􀲓P0(
                TT2)
      ENDFOR
   V i+1 􀲓ABCDEFGH 􀱇V i
       (   )           ()


   其中,字的存储为大端(      b
                    ig-
                      end
                        ian),左边为高有效位,右边为低有效位。

5.
 4 输出杂凑值

   ABCDEFGH 􀲓V n
                  ()


   输出 256 比特的杂凑值 y=ABCDEFGH 。




  4
                                                               GB/T 32905—2016




                                    附   录   A
                                 (资料性附录)
                                运   算   示       例



A.
 1 示例 1

 1.
A.1 输入十六进制数据

  616263

 1.
A.2 填充后的消息

  61626380 00000000 00000000 00000000 00000000 00000000 00000000 00000000
  00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000018

 1.
A.3 扩展后的消息

  W 0W 1 …W 67
  61626380 00000000 00000000 00000000 00000000 00000000 00000000 00000000
  00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000018
  9092e200 00000000 000c0606 719c70ed 00000000 8001801f 939f7da9 00000000
  2c6fa1f9 adaaef14 00000000 0001801e 9a965f89 49710048 23ce86a1 b2d12f1b
  e1dae338 f8061807 055d68be 86cfd481 1f447d83 d9023dbf 185898e0 e0061807
  050df55c cde0104c a5b9c955 a7df0184 6e46cd08 e3babdf8 70caa422 0353af50
  a92dbca1 5f33cfd2 e16f6e89 f70fe941 ca5462dc 85a90152 76af6296 c922bdb2
  68378cf5 97585344 09008723 86faee74 2ab908b0 4a64bc50 864e6e08 f07e6590
  325c8f78 accb8011 e11db9dd b99c0545
  W'0W'1 …W'63

  61626380 00000000 00000000 00000000 00000000 00000000 00000000 00000000
  00000000 00000000 00000000 00000018 9092e200 00000000 000c0606 719c70f5
  9092e200 8001801f 93937baf 719c70ed 2c6fa1f9 2dab6f0b 939f7da9 0001801e
  b6f9fe70 e4dbef5c 23ce86a1 b2d0af05 7b4cbcb1 b177184f 2693ee1f 341efb9a
  fe9e9ebb 210425b8 1d05f05e 66c9cc86 1a4988df 14e22df3 bde151b5 47d91983
  6b4b3854 2e5aadb4 d5736d77 a48caed4 c76b71a9 bc89722a 91a5caab f45c4611
  6379de7d da9ace80 97c00c1f 3e2d54f3 a263ee29 12f15216 7fafe5b5 4fd853c6
  428e8445 dd3cef14 8f4ee92b 76848be4 18e587c8 e6af3c41 6753d7d5 49e260d5

 1.
A.4 迭代压缩中间值

  j        A      B        C        D               E   F      G        H
      7380166f 4914b2b9 172442d7 da8a0600 a96f30bc 163138aa e38dee4d b0fb0e4e
  0   b9edc12b 7380166f 29657292 172442d7 b2ad29f4 a96f30bc c550b189 e38dee4d
  1   ea52428c b9edc12b 002cdee7 29657292 ac353a23 b2ad29f4 85e54b79 c550b189
  2   609f2850 ea52428c db825773 002cdee7 d33ad5fb ac353a23 4fa59569 85e54b79
                                                                            5
GB/T 32905—2016

   3   35037e59 609f2850 a48519d4 db825773 b8204b5f d33ad5fb d11d61a9 4fa59569
   4   1f995766 35037e59 3e50a0c1 a48519d4 8ad212ea b8204b5f afde99d6 d11d61a9
   5   374a0ca7 1f995766 06fcb26a 3e50a0c1 acf0f639 8ad212ea 5afdc102 afde99d6
   6   33130100 374a0ca7 32aecc3f 06fcb26a 3391ec8a acf0f639 97545690 5afdc102
   7   1022ac97 33130100 94194e6e 32aecc3f 367250a1 3391ec8a b1cd6787 97545690
   8   d47caf4c 1022ac97 26020066 94194e6e 6ad473a4 367250a1 64519c8f b1cd6787
   9   59c2744b d47caf4c 45592e20 26020066 c6a3ceae 6ad473a4 8509b392 64519c8f
   10 481ba2a0 59c2744b f95e99a8 45592e20 02afb727 c6a3ceae 9d2356a3 8509b392
   11 694a3d09 481ba2a0 84e896b3 f95e99a8 9dd1b58c 02afb727 7576351e 9d2356a3
   12 89cbcd58 694a3d09 37454090 84e896b3 6370db62 9dd1b58c b938157d 7576351e
   13 24c95abc 89cbcd58 947a12d2 37454090 1a4a2554 6370db62 ac64ee8d b938157d
   14 7c529778 24c95abc 979ab113 947a12d2 3ee95933 1a4a2554 db131b86 ac64ee8d
   15 34d1691e 7c529778 92b57849 979ab113 61f99646 3ee95933 2aa0d251 db131b86
   16 796afab1 34d1691e a52ef0f8 92b57849 067550f5 61f99646 c999f74a 2aa0d251
   17 7d27cc0e 796afab1 a2d23c69 a52ef0f8 b3c8669b 067550f5 b2330fcc c999f74a
   18 d7820ad1 7d27cc0e d5f562f2 a2d23c69 575c37d8 b3c8669b 87a833aa b2330fcc
   19 f84fd372 d7820ad1 4f981cfa d5f562f2 a5dceaf1 575c37d8 34dd9e43 87a833aa
   20 02c57896 f84fd372 0415a3af 4f981cfa 74576681 a5dceaf1 bec2bae1 34dd9e43
   21 4d0c2fcd 02c57896 9fa6e5f0 0415a3af 576f1d09 74576681 578d2ee7 bec2bae1
   22 eeeec41a 4d0c2fcd 8af12c05 9fa6e5f0 b5523911 576f1d09 340ba2bb 578d2ee7
   23 f368da78 eeeec41a 185f9a9a 8af12c05 6a879032 b5523911 e84abb78 340ba2bb
   24 15ce1286 f368da78 dd8835dd 185f9a9a 62063354 6a879032 c88daa91 e84abb78
   25 c3fd31c2 15ce1286 d1b4f1e6 dd8835dd 4db58f43 62063354 8193543c c88daa91
   26 6243be5e c3fd31c2 9c250c2b d1b4f1e6 131152fe 4db58f43 9aa31031 8193543c
   27 a549beaa 6243be5e fa638587 9c250c2b cf65e309 131152fe 7a1a6dac 9aa31031
   28 e11eb847 a549beaa 877cbcc4 fa638587 e5b64e96 cf65e309 97f0988a 7a1a6dac
   29 ff9bac9d e11eb847 937d554a 877cbcc4 9811b46d e5b64e96 184e7b2f 97f0988a
   30 a5a4a2b3 ff9bac9d 3d708fc2 937d554a e92df4ea 9811b46d 74b72db2 184e7b2f
   31 89a13e59 a5a4a2b3 37593bff 3d708fc2 0a1ff572 e92df4ea a36cc08d 74b72db2
   32 3720bd4e 89a13e59 4945674b 37593bff cf7d1683 0a1ff572 a757496f a36cc08d
   33 9ccd089c 3720bd4e 427cb313 4945674b da8c835f cf7d1683 ab9050ff a757496f
   34 c7a0744d 9ccd089c 417a9c6e 427cb313 0958ff1b da8c835f b41e7be8 ab9050ff
   35 d955c3ed c7a0744d 9a113939 417a9c6e c533f0ff 0958ff1b 1afed464 b41e7be8
   36 e142d72b d955c3ed 40e89b8f 9a113939 d4509586 c533f0ff f8d84ac7 1afed464
   37 e7250598 e142d72b ab87dbb2 40e89b8f c7f93fd3 d4509586 87fe299f f8d84ac7
   38 2f13c4ad e7250598 85ae57c2 ab87dbb2 1a6cabc9 c7f93fd3 ac36a284 87fe299f
   39 19f363f9 2f13c4ad 4a0b31ce 85ae57c2 c302badb 1a6cabc9 fe9e3fc9 ac36a284
   40 55e1dde2 19f363f9 27895a5e 4a0b31ce 459daccf c302badb 5e48d365 fe9e3fc9
   41 d4f4efe3 55e1dde2 e6c7f233 27895a5e 5cfba85a 459daccf d6de1815 5e48d365
   42 48dcbc62 d4f4efe3 c3bbc4ab e6c7f233 6f49c7bb 5cfba85a 667a2ced d6de1815
   43 8237b8a0 48dcbc62 e9dfc7a9 c3bbc4ab d89d2711 6f49c7bb 42d2e7dd 667a2ced
   44 d8685939 8237b8a0 b978c491 e9dfc7a9 8ee87df5 d89d2711 3ddb7a4e 42d2e7dd
   45 d2090a86 d8685939 6f714104 b978c491 2e533625 8ee87df5 388ec4e9 3ddb7a4e
  6
                                                              GB/T 32905—2016

  46 e51076b3 d2090a86 d0b273b0 6f714104 d9f89e61 2e533625 efac7743 388ec4e9