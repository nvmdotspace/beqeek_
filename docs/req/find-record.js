let curl = `
curl 'https://app.o1erp.com/api/workspace/732878538910205329/workflow/get/active_tables/826289384109113345/records' \
  -H 'accept: application/json, text/javascript, */*; q=0.01' \
  -H 'accept-language: vi,en-US;q=0.9,en;q=0.8' \
  -H 'authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJiciI6IjEiLCJpc3MiOiJodHRwczovL2FwcC5vMWVycC5jb20iLCJ0eXBlIjoyLCJ1c2VySWQiOiI4MTgwMDM4OTk5ODkzNjA2NDEiLCJpYXQiOjE3NjMxMjk1MjcsImV4cCI6IjIwMjUtMTEtMTRUMTQ6MTc6MDcuMDE5NzM3WiJ9.N_cJoNe9eiM6gdfCpTIqRADw2V_ATGLz6Le1L59K_SE' \
  -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'origin: https://beqeek.com' \
  -H 'priority: u=1, i' \
  -H 'referer: https://beqeek.com/' \
  -H 'sec-ch-ua: "Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: cross-site' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36' \
  --data-raw 'limit=10&offset=0'
`

let res = {
    "data": [
        {
            "id": "826385131127177217",
            "record": {
                "task_title": "+sNO3GIjKKl9\/2Wd\/L0V\/GX1K0c5wThhdjCen6TJ6pHBCDh1\/qUfTyWwTYd8LqnA",
                "task_description": "",
                "start_date": ";B@aI@epNqa3O)Bk@ljlIHna?;^qD\"x;I<,7Bo)*_,pV45G2acbv+!,OG&V;0+cL&yQkc&,^`B?9\"j\\*SqPO^nWtX,I%v5`F;DQixi<H@r)^OkE_43c5%&7tW\"@(wG1`Wnj[Wd@XLaOq30_99Xd*pt,!s\\q!939aV4(tfqQshM;0('ms+Fi`#p49Ih4cfGff4_b5hqW%L;'(tN0?bx&@X2E_wPfaw5dr)''wGDunS^1+q\\_DD2o*ISO(+,WHht)Lt[Q\\<r&o0i\"hL?wpu_GrE@L4<*r@%O;r@Bb);?#3N9lLi;Nmm?7%o#c@|qVt6Xu7VWK+azQqDLWQn1Tq+NbBeOE1jQ30DAPS5uGuCxiY95ODdnKFOhF7byiU1",
                "duo_date": ";B@aI@epNqa3O)Bk@ljlIHna?;^qD\"x;I<,7Bo)*_,pV45G2acbv+!,OG&V;0+cL&yQkc&,^`B?9\"j\\*SqPO^nWtX,I%v5`F;DQixi<H@r)^OkE_43c5%&7tW\"@(wG1`Wnj[Wd@XLaOq30_99Xd*pt,!s\\q!939aV4(tfqQshM;0('ms+Fi`#p49Ih4cfGff4_b5hqW%L;'(tN0?bx&@X2E_wPfaw5dr)0<Ml)5`dka5)FHXb[+P[[u7+`FD<1!Fv5kly(:*i+lD&4;[[L*m!*`\\0+rv,l#c,P^*1(?;\\_\"5ry+1h#EvVtff|5H9+3z9+RwmzcBuExLGA6RfjFxcHDlJ+ir8dOuLZTbyRBQoU7nuK0YbZ+jS9OcZa",
                "matrix_quadrant": "c420071e207dc0e0b534e51ee23322a19fdc9d3a20e50e82cab7af7cbea927e6",
                "no_plan": "2867deac45f75935c7f3435c98c0160b06890fa1c74e142d0cf9949cb6674154",
                "self_evaluation": "1772e9ae5c2c1202a547d4e51644875588e5545c2679633e8a28813b0ac297cd",
                "assignee": "822127519103713281",
                "status": "20bc534fb1cdf23178878ddbf795f550f76eb149475ec0b6d3eea85194c81322",
                "related_users": [],
                "color_tag": [],
                "notes": "tkyX1VW7LR93\/24wNVbQoJLCgxYWDrNMzGgz+Sxggtg=",
                "related_departments": [],
                "employee": "818047935265636353",
                "check_list": [],
                "year": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-aiYe5x]O~Y*Lo@Uio_$5^2'-YcEB^P+P\\rx@|GQ3lDRMGoKM7gGD3n8\/aI9vaIyQWOA4jtgC5RmaORqc=",
                "month": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d8NzO1IbX\/oZ|iso60CHA751kzICbYcwALv9mgSqR\/V+doG3p2zfQvPo=",
                "day": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d8NzO1IbX\/oZ|xLV\/k3hQNIGG4lLdL8kqRFcsP8NDeAzFd2J4dsV22XQ=",
                "hour": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d5aB,ZNVq]l8|sYdoF4b60E0K3SI4NxpOsEgFqf0evo8TixBWqEqDod4=",
                "minutes": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d5aB,ZNVq]l8|S78NRzmbsjA3rGT+FQCgcOHYySw7THs+pArcTKs29lQ=",
                "date": "'UPH_,=nx;j\";;tvqocwHgLDloZ\"285+l2+60a2\\)!54.L>1eL;U,ZNcD_KCpS0}FlGpSoEaPRl(>pXNO*\\gEl;zPzEf)QM~M(>73}Z.l_+\"#gIzaE|PawcieBcpSmZw3iLto3+CXy1+c1Fe2hsk+SOLAlpNPY=",
                "time": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIKx4UV3Ktmd)~N*D$?ZNyx8._IeWqwZTpzm_DLD5+wwlR+5G,R~xOEG@z-[PV3aYl4cb2l$d$:?3zrWk-tXk21Ez^@?yAK^,XT\/qEIOK*x-y:?--WTUZmmaWylA^@mVC`Cr(,KB5_)]$+I.]CYKqL|BY9sWu\/yByYDDbGpkekhnUBJrdcJbiSb+5pIHgzteEY=",
                "task_weight": 0,
                "money": "#xUFp.#>Sxw#zic'DvHvTeFpk9S.'*Nh0QHc7_pWTNL*ExncXzc.UQ{'p#Wi*z^N07+~7USpeRNHxQWXDch9+)@U.<!.i^HiHR9h{w4#kL*SpWQvvNkE79p*UzptRUwDT4cHOxZX)VnSZ!!*JOw{)zTRnELxA@UxN@D0DAE)e#O'.~n+X-{iik'q0kZQR{NS~t!~XAVHiqQEk<8_nV0)eiXSm_qEDZ0e>kND4-wOWTU<hk+X)8Fp~*4<.Lmqn)FX~c!_xx9wnxEt~9A_Qm8!Ae^n.tL@)T+q'.)0*xLXk@ZW*Ew~++0tSe_E9vNW@V+Z<TZ8'iE)exD@tE.T^8vtHm)k>e>EN4kEU*t^hwAL8EAzV>EAU'Oq8'OLi-*Qt0W+x00*D>@DSU~c.L#qeNe~AL9V-q8TZ4RFc*HX8#88w09*+eHF4t@~U.)O0pAi'4*_0t-XW-A_e'ViA#>0)w'__8nmLQ'U9@ehW!{*k+EFZWLiveTW#czpX0AX-'90n>44h{W!)UJ>m7e^{!+e04Jiw7i-SizznFDER'!-<AHnTm@mzLvJtz.9#*Jw808khAvNk^N.@Th<ZNFqE+.^'T+_JZZ_c@#i^8hRw>ekw)#Fn8))RLF'@9).xOvNJXzzNwppm8L>>@me8.U^LpTn7<#R<LnJvZL>LN@@WD#h*kN)TAFQLFqD8#D)pe0t9.tzXkLqVTnT0J!t>E8EnH9t*+'^EiAWqqRH#mt^xO@ETShTXmcV7_qXD)L#0q@NDS*wX'HJRVeUhc@_WqpEVV#~n'vq@qz_DW!HJVzzmt4-w>eF{n)8._v)@~c++qZ@*9z4#|7\/WeiSb41qS5KzmAEfLEEVaLgBNaWgb24j7\/8yt2wK0=",
                "customer_email": "y0sk7etpp2IRZzA2KFBuxEPc+tRuXi2y4wJyGil1eQPR5KTYzHO1cxHNDhml\/7yY",
                "home_url": "8kAPS7NJxUOt4CQ1a1n8M92f7mtKjsNKjJ+dAz26559m+RUhsQ3Asf22tutqcK0w",
                "check_money": ""
            },
            "createdBy": "818003899989360641",
            "updatedBy": "818003899989360641",
            "createdAt": "2025-11-04 17:27:36",
            "updatedAt": "2025-11-14 21:30:53",
            "valueUpdatedAt": {
                "matrix_quadrant": "2025-11-14 21:30:53",
                "no_plan": "2025-11-04 17:27:36",
                "self_evaluation": "2025-11-04 17:27:36",
                "assignee": "2025-11-04 17:27:36",
                "status": "2025-11-04 17:27:36",
                "employee": "2025-11-04 17:27:36"
            },
            "relatedUserIds": [
                "818003899989360641",
                "822127519103713281"
            ],
            "assignedUserIds": [],
            "record_hashes": [],
            "hashed_keywords": [],
            "permissions": {
                "access": true,
                "update": true,
                "delete": true,
                "comment_create": true
            }
        },
        {
            "id": "829192023310336001",
            "record": {
                "task_title": "7QTuGRW17nky0nKZlVr1C31NJQZ\/luF6obcSHt2udLoZ7gBPMCZiv8uMqsvMoPTz",
                "task_description": "XuckzX\/q6DS5AU0X5aTo8C6HFBaWfkWjYhB4AlCFMPGF3zLAzGJTTTEgCRo6XqOsL3o2+IpDWTFfjvP8fe+3Ntz1NPgakt\/Te3851voAmJg1gIPY07bCL3FEVcq4e8Hhn72j5crCcs1SChDUDNF+NrRJxx0mCi0HV8aO8zn0LJidymYbG3ZLhE4iVmoO088FEAPMbULtnXEEikAHmY+fTHPF547VTQNCgMe2pWqdK6vQsLWAmzsGWiGpJuyYDRuXuXm2ds4MCODvaIOthusCCceO2C3L+Tt+I4bLtZ+O9bMseuawjxy+k9PaUhKx\/IHgZ0myQnYeQBrZ+OrDoDxaA8uwuKD+nHHrOh8jtGnHFZAqMrLQiksta1q+QsUgN29bJzy8Ays3LMrYuQtW2JFKiWt0HsW2H74oavFfs4BJXZ8s7kbXwzXq7NSHr8HnNdAKQ6mqCXggsOdNJltFKwO8+pA6unxkCW8Lm6ITmk\/bzFLaRKNncOpKIUVehLYeDknXqjxxZd4NxeIOIx16ofJxbyXINDu1Azq7CkKwvq\/T\/5hsKDq6TykKZUXovB97KTudlwQRnazNB\/5NutFeApqffFGiJscq0Qmhlc\/0Dv+SeifCSbe4A8PLAgpyGuybDHs3UD5wQQK\/Lf8\/E3imTVmOxIwd\/ronchFl\/aZpBvtK3PQKNWMt\/ybvSlY8+4T3bXuMRWjmmSyx7wG0z3fZQ73blI8KoPcdkuOfNio+vE5k6KQ31JkkoNHxql61N1b4l0SAligk6eYCbVarAq59wWuQS4X17ZMG9utbYbEp44q+aaV18g8AXzerYGcwzuhNHZVXd44dmuXYBEH76U9hqDcxKsI3yx2yI1zGU1nPdQiO+kQ=",
                "start_date": "@Oeof^1'n;Lsk0MnbHth+m@!,cE*tut3^),eDWbS`tWG\\%#Gn(IG&3Ol:+NG2p'jdpIpNb:<?)W9O?x?MP1l!_(3`30cuDmD_V9emsk%3Sw7bn*iL&7NV')HeSqIuGtQ5ta%dvVf;MLh7Qruxe\\:m4),;2@Q3ot&(!7k!m7`E&^o\"7NaaL#h_jSdj(p,<;EE*#y%l^*Nl3[s%9j,[cH@c,<4Gs3S`pXwEvFn4Qqv\\Dd5cqpuPNDWt?4qI)Fy&\"pVe17a4r:*bv@cqwO@u4;I[)i5PWk(:k0fM3G^E+FhX#po`;:+#syt4E0^|AP+PZg9j4n2LQi6gFYdCdS\/1tRcQRodPt1uBIEr35Cg0qbO3QyyIesYwz8g2u+Ug",
                "duo_date": "@Oeof^1'n;Lsk0MnbHth+m@!,cE*tut3^),eDWbS`tWG\\%#Gn(IG&3Ol:+NG2p'jdpIpNb:<?)W9O?x?MP1l!_(3`30cuDmD_V9emsk%3Sw7bn*iL&7NV')HeSqIuGtQ5ta%dvVf;MLh7Qruxe\\:m4),;2@Q3ot&(!7k!m7`E&^o\"7NaaL#h_jSdj(p+@_[(B;?)qv3l9`vPP\\fI1L\\qFim3`G!FDxV&[![3\"a,emN&N^^wQv&n5BEtjk0+V0xBwN1Go(ikxrGBB&(13(rl#?*Q\\V::\\xB)IrhVnmSu2'1G3SO)W4wLik09F|lJ560d2flxJ1D2I84iwHlSTxfW0\/TLewauz9v1siehqDBNyaWWaYyhHHKLF4pT1F",
                "matrix_quadrant": "1244333093fcd188f1a99661e2208834be5e589391c2f8b697f4cac2ed177141",
                "no_plan": "94bff9092b565fe7ce79a72ba2eb68c75c33733dd7088b272598316b4dd326e4",
                "self_evaluation": "609b052e2d09b0dafd24c6080b72ae84bb987fd4a8a04d6dc24864801274d18f",
                "assignee": "822127519103713281",
                "status": "a233cd0337621d8f893a5c83c7d348a9a5069634f731d6edb6e90ffb22cd1ab4",
                "related_users": [],
                "color_tag": [],
                "notes": "tnxeIEHJKNXWI0OrdNd5zjizVXnlnMflI\/OypwcG93Y=",
                "related_departments": [],
                "check_list": [],
                "year": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-aiYe5x]O~Y*Lo@Uio_$5^2'-YcEB^P+P\\rx@|64FgcmOOG7WHwlpMim\/NsNFEG4oYiC8YkB3XaLyHPFQ=",
                "month": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d8NzO1IbX\/oZ|qUtvwC958uA42FUeXr\/zY\/J4G7BhO+op3GCdOJyePrY=",
                "day": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d8NzO1IbX\/oZ|\/1\/65Ub\/zFNtonVvPF1ejQ1MPfuTNONYcckY5B5vNxI=",
                "hour": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d5aB,ZNVq]l8|7fU\/ByCts84fFIynrRcThUGzJ4hLxpeZp4E8eNWpAHE=",
                "minutes": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d5aB,ZNVq]l8|X82XQx\/s\/Cb3O7wwJ4GIV9W\/F2onTjjJJJxwbNhIpFA=",
                "time": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIKx4UV3Ktmd)~N*D$?ZNyx8._IeWqwZTpzm_DLD5+wwlR+5G,R~xOEG@z-[PV3aYl4cb2l$d$:?3zrWk-tXk21Ez^@?yAK^,XT\/qEIOK*x-y:?--WTUZmmaWylA^@mVC`Cr(,KB5_)]$+I.]CYKqL|l4si+9eCdUPSvu4BOuzQt3UzGLqQXFUr5H7BCARvrU0=",
                "task_weight": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okr@t\/oV`[r[~DWGw5cBt)Z1.|7+FQ1lHq2e\/InyqaDXYNqwlCfF62UDsiZKKoIgtoCLs=",
                "money": "#xUFp.#>Sxw#zic'DvHvTeFpk9S.'*Nh0QHc7_pWTNL*ExncXzc.UQ{'p#Wi*z^N07+~7USpeRNHxQWXDch9+)@U.<!.i^HiHR9h{w4#kL*SpWQvvNkE79p*UzptRUwDT4cHOxZX)VnSZ!!*JOw{)zTRnELxA@UxN@D0DAE)e#O'.~n+X-{iik'q0kZQR{NS~t!~XAVHiqQEk<8_nV0)eiXSm_qEDZ0e>kND4-wOWTU<hk+X)8Fp~*4<.Lmqn)FX~c!_xx9wnxEt~9A_Qm8!Ae^n.tL@)T+q'.)0*xLXk@ZW*Ew~++0tSe_E9vNW@V+Z<TZ8'iE)exD@tE.T^8vtHm)k>e>EN4kEU*t^hwAL8EAzV>EAU'Oq8'OLi-*Qt0W+x00*D>@DSU~c.L#qeNe~AL9V-q8TZ4RFc*HX8#88w09*+eHF4t@~U.)O0pAi'4*_0t-XW-A_e'ViA#>0)w'__8nmLQ'U9@ehW!{*k+EFZWLiveTW#czpX0AX-'90n>44h{W!)UJ>m7e^{!+e04Jiw7i-SizznFDER'!-<AHnTm@mzLvJtz.9#*Jw808khAvNk^N.@Th<ZNFqE+.^'T+_JZZ_c@#i^8hRw>ekw)#Fn8))RLF'@9).xOvNJXzzNwppm8L>>@me8.U^LpTn7<#R<LnJvZL>LN@@WD#h*kN)TAFQLFqD8#D)pe0t9.tzXkLqVTnT0J!t>E8EnH9t*+'^EiAWqqRH#mt^xO@ETShTXpSQmnz880-mw~F~vXv'k<~XnAZ+Qhii#'O7#LL^c4WQcXE~v'{OW-+_hLVDAF4@+-S+O>+p^X-{7xXQ*Zz@@|MxwaY\/dSEnWQSD7jo50xFYikoIFU1SNpK1wUhJBH7AI=",
                "customer_email": "rSaAJq9s5uBl8AVj2u2QvvidI1J3j8Ig87mLEUZ\/eYNRAGR\/pal8VAv8eO+EI+r2",
                "home_url": "fyJncKdqg+jrKehWsS8R2lYRW3XUfkDUFSU6l5pN7sfhX7NrwYek\/qAZG8gOuNlt",
                "check_money": "3e65aa2dada0e8afbe30b2cafa4fd2a3624129b74996778cb64da9aabd78b858"
            },
            "createdBy": "818003899989360641",
            "updatedBy": "818003899989360641",
            "createdAt": "2025-11-12 11:21:11",
            "updatedAt": "2025-11-14 21:31:17",
            "valueUpdatedAt": {
                "matrix_quadrant": "2025-11-14 21:31:16",
                "no_plan": "2025-11-12 11:21:11",
                "self_evaluation": "2025-11-12 11:21:11",
                "assignee": "2025-11-12 11:21:11",
                "status": "2025-11-12 11:21:11"
            },
            "relatedUserIds": [
                "818003899989360641",
                "822127519103713281"
            ],
            "assignedUserIds": [],
            "record_hashes": [],
            "hashed_keywords": [],
            "permissions": {
                "access": true,
                "update": true,
                "delete": true,
                "comment_create": true
            }
        },
        {
            "id": "829197318459752449",
            "record": {
                "task_title": "EbGxnrxMgSJ8hvOxnMMxlaInc2hNMAYcK7Tlu1UZpBc=",
                "task_description": "FdJkYQj1\/GhXgUq4MlCaYfPFLcHkxQklfnXfZoEF6wc72w3kbwNUpOA00WFlsLWcJFx5zArBRgk5gmn\/zqG8YQ==",
                "matrix_quadrant": "c420071e207dc0e0b534e51ee23322a19fdc9d3a20e50e82cab7af7cbea927e6",
                "status": "20bc534fb1cdf23178878ddbf795f550f76eb149475ec0b6d3eea85194c81322",
                "related_users": [],
                "color_tag": [],
                "related_departments": [],
                "check_list": [],
                "year": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-aiYe5x]O~Y*Lo@Uio_$5^2'-YcEB^P+P\\rx@|RXjE1RStPRfiS+S8RDefa9oVtrVX1rf56VTLFO9T9Ms=",
                "month": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d8NzO1IbX\/oZ|ddr1DmEBlgy8hHGD13ZzO84fdHpqZM5Pvs8tJbfx68U=",
                "day": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d8NzO1IbX\/oZ|2knVTqkCA5QD3OWY2pa32NwX3aKtUree2gcrUkj2Cdg=",
                "hour": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d5aB,ZNVq]l8|oV83T3zmREy9X2tRuZcLzu7tqmQyH4P18Xrf6PCONKg=",
                "minutes": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d5aB,ZNVq]l8|gWbOsO2QKIafLDxBOYlNVlhbG3HBidgCypd\/v4a3i9I=",
                "date": "'UPH_,=nx;j\";;tvqocwHgLDloZ\"285+l2+60a2\\)!54.L>1eL;U,ZNcD_KCpS0}FlGpSoEaPRl(>pXNO*\\gEl;zPzEf)_OBIt'&-kq\\o]$+\\#PX8G|uPHFpsvJojjinjIOSdK89pQAT9E25eKpTyJxIW8ewQA=",
                "time": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIKx4UV3Ktmd)~N*D$?ZNyx8._IeWqwZTpzm_DLD5+wwlR+5G,R~xOEG@z-[PV3aYl4cb2l$d$:?3zrWk-tXk21Ez^@?yAK^,XT\/qEIOK*x-y:?--WTUZmmaWylA^@mVC`Cr(,KB5_)]$+I.]CYKqL|t6aZvBBJj5jqaDRNQnIreMC4CfGHPVPVCJYQClCZ\/RE=",
                "money": "#xUFp.#>Sxw#zic'DvHvTeFpk9S.'*Nh0QHc7_pWTNL*ExncXzc.UQ{'p#Wi*z^N07+~7USpeRNHxQWXDch9+)@U.<!.i^HiHR9h{w4#kL*SpWQvvNkE79p*UzptRUwDT4cHOxZX)VnSZ!!*JOw{)zTRnELxA@UxN@D0DAE)e#O'.~n+X-{iik'q0kZQR{NS~t!~XAVHiqQEk<8_nV0)eiXSm_qEDZ0e>kND4-wOWTU<hk+X)8Fp~*4<.Lmqn)FX~c!_xx9wnxEt~9A_Qm8!Ae^n.tL@)T+q'.)0*xLXk@ZW*Ew~++0tSe_E9vNW@V+Z<TZ8'iE)exD@tE.T^8vtHm)k>e>EN4kEU*t^hwAL8EAzV>EAU'Oq8'OLi-*Qt0W+x00*D>@DSU~c.L#qeNe~AL9V-q8TZ4RFc*HX8#88w09*+eHF4t@~U.)O0pAi'4*_0t-XW-A_e'ViA#>0)w'__8nmLQ'U9@ehW!{*k+EFZWLiveTW#czpX0AX-'90n>44h{W!)UJ>m7e^{!+e04Jiw7i-SizznFDER'!-<AHnTm@mzLvJtz.9#*Jw808khAvNk^N.@Th<ZNFqE+.^'T+_JZZ_c@#i^8hRw>ekw)#Fn8))RLF'@9).xOvNJXzzNwppm8L>>@me8.U^LpTn7<#R<LnJvZL>LN@@WD#h*kN)TAFQLFqD8#D)pe0t9.tzXkLqVTnT0J!t>E8EnH9t*+'^EiAWqqRH#mt^xO@ETShTXmcV7_qXD)L#0q@NDS*wX'HJRVeUhc@_WqpEVV#~n'vq@qz_DW!HJVzzmt4-w>eF{n)8._v)@~c++qZ@*9z4#|FILKwK9r\/IQFQsq0JlKohaKq3\/3xz2WcGxbADd6z0sk=",
                "customer_email": "f+WM442V2lRWHgnGFh674\/YFdKcj6PBi3Y2xtDv33ORPbiagAT5+CQP\/OP85g5El",
                "home_url": "CYtOJUbwE3kdC9jSlmkpyKNxKaj15a2+ZwPl2HRHYC9oqE7JYu6mxo3pKX0X966v"
            },
            "createdBy": "818003899989360641",
            "updatedBy": "0",
            "createdAt": "2025-11-12 11:42:14",
            "updatedAt": null,
            "valueUpdatedAt": {
                "matrix_quadrant": "2025-11-12 11:42:14",
                "status": "2025-11-12 11:42:14"
            },
            "relatedUserIds": [],
            "assignedUserIds": [],
            "record_hashes": [],
            "hashed_keywords": [],
            "permissions": {
                "access": true,
                "update": true,
                "delete": true,
                "comment_create": true
            }
        },
        {
            "id": "830003238471204865",
            "record": {
                "task_title": "p85zrCnIqxIzj4yUFYgw8yivWKxdZbrfSvUlV6\/nfKs=",
                "matrix_quadrant": "1244333093fcd188f1a99661e2208834be5e589391c2f8b697f4cac2ed177141",
                "status": "20bc534fb1cdf23178878ddbf795f550f76eb149475ec0b6d3eea85194c81322",
                "related_users": [],
                "color_tag": [],
                "related_departments": [],
                "check_list": [],
                "year": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-aiYe5x]O~Y*Lo@Uio_$5^2'-YcEB^P+P\\rx@|i9lAbcsnxMlEuCy77Q\/OW725Vktn\/id0wZrnoQ1EstA=",
                "month": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d8NzO1IbX\/oZ|pDoAjSRWelQF+p2agDPFFws6VQM3AuQx+qmFncAkOqI=",
                "day": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d8NzO1IbX\/oZ|m1Bxttc98AFPuAfqa9BwI1rQw6+rcX7MdlzVxhrTQMs=",
                "hour": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d5aB,ZNVq]l8|jamZSs11UJe8ghyH9aSIUnsF2x\/SpYugYZNvAK5Bd80=",
                "minutes": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIabwm.4XA'VpW\/AYOLZ]d[okCA+aG_IUyap1NBVi+-Rc^mkG2rxaA^Rr1q,t$P,ODTzz[*p,KtXD^(]YJU3'LWPz**~tcPI:TzLYk@c35wiLVbtm-`cbWmGk3zw4okp~(A@WCI~,`d5aB,ZNVq]l8|w9EyTHTJYa0beRrvDEFkFd9NDx80dfJw\/0uQpiWnxEk=",
                "time": ".)I@2IC'+Rz*\/PAaNmNYRBTc~-PUO(-N$d'RRcRp\/lmeAc3~R\/P,^@\\rG~$z:aO^5(tyD'W]b221mEGmr@\/w4eIKx4UV3Ktmd)~N*D$?ZNyx8._IeWqwZTpzm_DLD5+wwlR+5G,R~xOEG@z-[PV3aYl4cb2l$d$:?3zrWk-tXk21Ez^@?yAK^,XT\/qEIOK*x-y:?--WTUZmmaWylA^@mVC`Cr(,KB5_)]$+I.]CYKqL|2e0uUkuQKDesEB2gcwnjgdMwobl2HMSRly139Lg92Uw=",
                "money": "#xUFp.#>Sxw#zic'DvHvTeFpk9S.'*Nh0QHc7_pWTNL*ExncXzc.UQ{'p#Wi*z^N07+~7USpeRNHxQWXDch9+)@U.<!.i^HiHR9h{w4#kL*SpWQvvNkE79p*UzptRUwDT4cHOxZX)VnSZ!!*JOw{)zTRnELxA@UxN@D0DAE)e#O'.~n+X-{iik'q0kZQR{NS~t!~XAVHiqQEk<8_nV0)eiXSm_qEDZ0e>kND4-wOWTU<hk+X)8Fp~*4<.Lmqn)FX~c!_xx9wnxEt~9A_Qm8!Ae^n.tL@)T+q'.)0*xLXk@ZW*Ew~++0tSe_E9vNW@V+Z<TZ8'iE)exD@tE.T^8vtHm)k>e>EN4kEU*t^hwAL8EAzV>EAU'Oq8'OLi-*Qt0W+x00*D>@DSU~c.L#qeNe~AL9V-q8TZ4RFc*HX8#88w09*+eHF4t@~U.)O0pAi'4*_0t-XW-A_e'ViA#>0)w'__8nmLQ'U9@ehW!{*k+EFZWLiveTW#czpX0AX-'90n>44h{W!)UJ>m7e^{!+e04Jiw7i-SizznFDER'!-<AHnTm@mzLvJtz.9#*Jw808khAvNk^N.@Th<ZNFqE+.^'T+_JZZ_c@#i^8hRw>ekw)#Fn8))RLF'@9).xOvNJXzzNwppm8L>>@me8.U^LpTn7<#R<LnJvZL>LN@@WD#h*kN)TAFQLFqD8#D)pe0t9.tzXkLqVTnT0J!t>E8EnH9t*+'^EiAWqqRH#mt^xO@ETShTXmcV7_qXD)L#0q@NDS*wX'HJRVeUhc@_WqpEVV#~n'vq@qz_DW!HJVzzmt4-w>eF{n)8._v)@~c++qZ@*9z4#|GVr48Ora55XYk67DeQNgy6eznPz4eG5dIrd2KCqB2V4=",
                "customer_email": "qtwCVYnO4Svwvg1YS4MyKzqqX5O2eahverRyAL88Bb3r6cwmcbKW7iBQUd8Xvjhe",
                "home_url": "royem7RjNZZb3Jni6vBhz6E4zteibnH81ddrxeVUSzcHZsnXb6hKAFX6ZNGcRYxf",
                "check_money": "3e65aa2dada0e8afbe30b2cafa4fd2a3624129b74996778cb64da9aabd78b858"
            },
            "createdBy": "818003899989360641",
            "updatedBy": "818003899989360641",
            "createdAt": "2025-11-14 17:04:40",
            "updatedAt": "2025-11-14 21:30:14",
            "valueUpdatedAt": {
                "matrix_quadrant": "2025-11-14 21:30:14",
                "status": "2025-11-14 17:04:40"
            },
            "relatedUserIds": [],
            "assignedUserIds": [],
            "record_hashes": [],
            "hashed_keywords": [],
            "permissions": {
                "access": true,
                "update": true,
                "delete": true,
                "comment_create": true
            }
        }
    ],
    "next_id": null,
    "previous_id": null
}
